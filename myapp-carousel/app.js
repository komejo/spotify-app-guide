var sp = getSpotifyApi(1),
    models = sp.require('sp://import/scripts/api/models'),
    views = sp.require('sp://import/scripts/api/views'),
    ui = sp.require('sp://import/scripts/ui'),
    appData;

function renderPlaylists() {
  for (i in appData.Playlists) {
    var playlist    = models.Playlist.fromURI(appData.Playlists[i].uri),
        description = appData.Playlists[i].description,
        title       = playlist.data.name,
        index       = i,
        img         = new ui.SPImage(playlist.data.cover),
        listView    = new views.List(playlist, function(track) {
          return new views.Track(track, views.Track.FIELD.STAR | views.Track.FIELD.NAME | views.Track.FIELD.DURATION);
        });
    $("#playlists").append(
      '<div id="playlist-'+i+'" class="playlist"> \
        <div class="playlist-info"> \
          <div class="playlist-img-'+i+'"><a class="plink" href="'+playlist.uri+'"></a></div> \
            <h3>'+title+'</h3> \
            <button class="add-playlist button icon" value="'+playlist.uri+'"> \
              <span class="plus"></span>Subscribe</button> \
            <p>'+description+'</p> \
          </div> \
        </div> \
      </div>')
      .each(function() {
        $(this).find('.playlist-img-'+i+' a').append(img.node).end()
          .find('#playlist-'+i+' .playlist-info').append(listView.node);
      });
  }
  $('.add-playlist').on('click', function() {
    var playlist = models.Playlist.fromURI($(this).attr('value'));
    playlist.subscribed = true;
  });
}

function renderAlbums() {
  for (var i in appData.Albums) {
    function makeFunc(i) {
      function displayAlbum(i) {
        models.Album.fromURI(appData.Albums[i].uri, function(album) {
          var artist = album.artist.name,
              cover = album.data.cover,
              description = appData.Albums[i].description,
              index = i,
              title = album.name,
              allTracks = (album.tracks);
          var pl = new models.Playlist();
              pl.add(allTracks);
          var listView = new views.List(pl, function(allTracks) {
            return new views.Track(allTracks, views.Track.FIELD.STAR | views.Track.FIELD.NAME);
          })
          $("#albums").append(
            '<div id="album-'+i+'" class="album"> \
               <div class="album-info"> \
                 <div class="album-img-'+i+'"><a class="plink" href="'+album.uri+'"></a></div> \
                 <h3>'+title+'</h3> \
                 <button class="add-playlist button icon" value="'+album.uri+'"> \
                   <span class="plus"></span>Subscribe</button> \
                 <p>'+description+'</p> \
               </div> \
             </div>')
             .each(function() {
               $(this).find('.album-img-'+i+' a')
                 .append('<div class="image" style="background-image:url('+cover+');"></div>').end()
                 .find('#album-'+i+' .album-info').append(listView.node);
             });
             $('#album-'+i+' .add-playlist').on('click', function() {
               var MyPlaylist = new models.Playlist(album.name + " by " + album.artist.name);
               $.each(album.tracks,function(i,track){
                 MyPlaylist.add(track)
               });
               MyPlaylist.subscribed = true;
             });
          });
        }
        return displayAlbum;
    }
    var myFunc = makeFunc();
    myFunc(i);
  }
}

// Various date comparisons
var dates = {
    convert:function(d) {
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}

// Date boundries and values.
var oldest = new Date(); // oldest date allowed (90 days)
    oldest.setDate(oldest.getDate()-90);
var yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);
var today = new Date(); // today
var tomorrow = new Date(); // tomorrow
    tomorrow.setDate(tomorrow.getDate()+1);

function renderSongOfTheDay() {
  for (i in appData.Tracks) {
    function makeFunc(i) {
      function displayTrack(i) {
        var track   = models.Track.fromURI(appData.Tracks[i].uri, function(track) {
          img     = new ui.SPImage(track.image),
          date    = appData.Tracks[i].date,
          artist  = track.artists.join(),
          description = appData.Tracks[i].description,
          index   = i,
          title   = track.name;

          // Make playlist based on track uri
          var pl = new models.Playlist();
          pl.add(track.data.uri);
          var listView = new views.List(pl, function(track) {
              return new views.Track(track, views.Track.FIELD.STAR | views.Track.FIELD.DURATION);
          });
          // Make a player for the cover
          var player = new views.Player();
          player.track = pl.get(0);
          player.context = pl;

          // Get the number of valid SOTD tracks
          numberOfDates = $.map(appData.Tracks, function(o,index) {
              return (dates.inRange(o.date,oldest,today) ? o.date : null);
          });
          nDates = numberOfDates.length -1;

          // the most recent song within the allowed range
          if (i==nDates) {
            $("#song-of-the-day").append(
            '<h2>Song of the Day</h2> \
            <div id="song-of-the-day-'+i+'" class="song-of-the-day"> \
              <div class="song-of-the-day-info"> \
                <div class="pager"> \
                  <div class="paging active"> \
                    <ul> \
                      <li class="prev"><a href="#previous">Previous</a></li> \
                      <li class="next inactive"><a href="#next">Next</a></li> \
                    </ul> \
                  </div> \
                </div> \
                <div id="song-of-the-day-img-'+i+'" class="song-of-the-day-img"></div> \
                <div class="sotd-info"> \
                  <h3 class="title">'+title+'</h3> \
                  <h3 class="artist">'+artist+'</h3> \
                  <p class="track-link"></p> \
                </div> \
                <p class="desc">'+description+'</p> \
              </div> \
            </div>')
            $(".song-of-the-day-img").append(player.node);
            $(".track-link").append(listView.node);
            $(".song-of-the-day").css({"display":"block"});
          }
        });
      }
      return displayTrack
    }
    var myFunc = makeFunc();
    myFunc(i);
  }
  // Set the data-dates attributes.
  $('.prev').attr('data-dates',nDates-1)
  $('.next').attr('data-dates',nDates)

  // Prev / Next buttons
  $('.prev').on('click', function() {
      var prev = parseInt($(this).attr('data-dates'));
      renderNextSong(appData.Tracks[prev].date);
      if (prev > 0) {
          $(this).parent().find('.next')
              .removeClass('inactive')
              .attr('data-dates',prev+1);
          $(this).attr('data-dates',prev-1);
      } else if (prev == 0) {
          $(this).parent().find('.next')
              .removeClass('inactive')
              .attr('data-dates',prev+1);
          $(this).addClass('inactive');
      }
  });
  $('.next').on('click', function() {
      var next = parseInt($(this).attr('data-dates'));
      renderNextSong(appData.Tracks[next].date);
      if (next < nDates) {
          $(this).parent().find('.prev')
              .removeClass('inactive')
              .attr('data-dates',next-1);
          $(this).attr('data-dates',next+1);
      } else if (next == nDates) {
          $(this).parent().find('.prev')
              .removeClass('inactive')
              .attr('data-dates',next-1);
          $(this).addClass('inactive');
      }
  });
}

function renderNextSong(playerDate) {
    for (i in appData.Tracks) {
        function makeFunc(i) {
            function displayTrack(i) {
                var track   = models.Track.fromURI(appData.Tracks[i].uri, function(track) {
                    img     = new ui.SPImage(track.image),
                    date    = appData.Tracks[i].date;

                    // Make playlist based on track uri
                    var pl = new models.Playlist();
                    pl.add(track.data.uri);
                    var listView = new views.List(pl, function(track) {
                        return new views.Track(track, views.Track.FIELD.STAR | views.Track.FIELD.DURATION);
                    })
                    var player = new views.Player();
                    player.track = pl.get(0);
                    player.context = pl;

                    if (date == playerDate) {
                        $(".sotd-info .title").html(track.name)
                        $(".sotd-info .artist").html(track.artists.join())
                        $(".song-of-the-day-info .desc").html(appData.Tracks[i].description)
                        $(".song-of-the-day-img").html(player.node);
                        $(".track-link").html(listView.node);
                    }
                });
            }
          return displayTrack
        }
        var myFunc = makeFunc();
        myFunc(i);
    }
}




function init() {
    renderPlaylists();
    renderAlbums();
    renderSongOfTheDay()
    var dom = sp.require('sp://import/scripts/dom');
    var loadingEl = dom.queryOne('.loading');
    dom.destroy(loadingEl);
    var loadingEl2 = dom.queryOne('.loading2');
    dom.destroy(loadingEl2);
    var loadingEl3 = dom.queryOne('.loading3');
    dom.destroy(loadingEl3);
}

$(document).ready(function(){
    $.ajax({
        url      : 'app.json',
        dataType : 'json',
        type     : 'POST',
        error    : function(jqXHR, textStatus, errorThrown){
            console.log(textStatus);
            console.log(errorThrown);
        },
        success  : function(data, textStatus, jqXHR) {
            appData = data;
            init();
        }
    });
});