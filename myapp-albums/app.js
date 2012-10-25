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

function init() {
    renderPlaylists();
    renderAlbums();
    var dom = sp.require('sp://import/scripts/dom');
    var loadingEl = dom.queryOne('.loading');
    dom.destroy(loadingEl);
    var loadingEl2 = dom.queryOne('.loading2');
    dom.destroy(loadingEl2);
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