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
          return new views.Track(track, views.Track.FIELD.STAR | views.Track.FIELD.NAME );
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

function init() {
    renderPlaylists();
    var dom = sp.require('sp://import/scripts/dom');
    var loadingEl = dom.queryOne('.loading');
    dom.destroy(loadingEl);
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