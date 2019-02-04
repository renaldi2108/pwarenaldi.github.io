const App = (function() {
  var toast = $('#success');
  var close = $('#close');
  var dbPromise = idb.open("mydatabase", 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains("localdata")) {
      upgradeDb.createObjectStore("localdata");
    }
  });

  let instance;
  var datas;

  close.click(function() {
    toast.hide();
  });
  
  function init() {
    $('.button-collapse').sideNav();
    $('.carousel.carousel-slider').carousel({ fullWidth: true });
  }
  function standingTemplate(data) {
    const tmpl = '<tr>'
    +   '<td><a href="schedule.html?id=' +data.team.id+ '">' + data.team.name + '</a></td>'
    +   '<td>' + data.playedGames + '</td>'
    +   '<td>' + data.won + '</td>'
    +   '<td>' + data.draw + '</td>'
    +   '<td>' + data.lost + '</td>'
    +   '<td>' + data.points + '</td>'
    +   '</tr>';

    return tmpl;
  }
  function scheduleTemplate(data, status) {
    var tmpl;
    if(status == 0) {
      tmpl = '<div class="card">'
      +   '<div class="card-content"><div class="row"><div class="collection">'
      +   '<div class="collection-item"><span class="badge">0</span><span>'+data.homeTeam.name+'</span></div>'
      +   '<div class="collection-item"><span class="badge">0</span><span>'+data.awayTeam.name+'</span></div>'
      +   '</div>'
      +   '<a class="btncard waves-effect waves-light btn col s12">add</a>'
      +   '</div></div></div>';
    } else {
      tmpl = '<div class="card">'
      +   '<div class="card-content"><div class="row"><div class="collection">'
      +   '<div class="collection-item"><span class="badge">0</span><span>'+data.homeTeam.name+'</span></div>'
      +   '<div class="collection-item"><span class="badge">0</span><span>'+data.awayTeam.name+'</span></div>'
      +   '</div>'
      +   '<a class="btncard waves-effect waves-light btn col s12">remove</a>'
      +   '</div></div></div>';
    }

    return tmpl;
  }
  function getAllDb() {
    const scheduleDOM = $('#schedule');
    const preloader = $('#preloader');
    let list = '';

    dbPromise.then(function(db) {
      var tx = db.transaction('localdata', 'readonly');
      var store = tx.objectStore('localdata');
      return store.getAll();
    }).then(function(data) {
      if (!data) {
        preloader
          .hide()
          .find('> div')
          .removeClass('active');
          scheduleDOM.append('<h3>Error while fetching the data!</h3>');
        return;
      }

      data.map(function(d) {
        list += scheduleTemplate(d, 1);
        return d;
      });

      console.log(data);

      scheduleDOM.html(list);
      $('.btncard').click(function() {
        var position = $('.btncard').index(this);
        console.log(data[position]);
        removeOffline(data[position].id);
      });
    });
  }
  function removeOffline(data) {
    dbPromise.then(function(db) {
      var tx = db.transaction('localdata', 'readwrite');
      var store = tx.objectStore('localdata');
      store.delete(data);
      return tx.complete;
    }).then(function() {
      getAllDb();
      toast.show();
    });
  }
  function addToOffline(data) {
    dbPromise.then(function(db) {
      var tx = db.transaction('localdata', 'readwrite');
      var store = tx.objectStore('localdata');
      var item = data;
      store.add(item, data.id);
      return tx.complete;
  }).then(function() {
    toast.show();
      console.log('Buku berhasil disimpan.');
  }).catch(function() {
      console.log('Buku gagal disimpan.')
  })
  }
  function standingLeague() {
      const standingDOM = $('#standing');
      const preloader = $('#preloader');
      let list = '';

      $.ajax({
        method: 'GET',
        headers: {
          "X-Auth-Token": "d767b16fae7e4b4d9a3abf8e483e4351"
        },
        url: 'https://api.football-data.org/v2/competitions/2002/standings',
      }).done(function(data) {
        if (!data) {
          preloader
            .hide()
            .find('> div')
            .removeClass('active');
            standingDOM.append('<h3>Error while fetching the data!</h3>');
          return;
        }

        data.standings[0].table.map(function(d) {
          list += standingTemplate(d);

          return d;
        });

        console.log(data.standings[0].table);

        standingDOM.html('<table class = "responsive-table highlight bordered">'+
        '<thead>' +
        '<tr><th>Klub</th><th>PD</th><th>M</th><th>S</th><th>K</th><th>Poin</th></tr></thead><tbody>' + list + '</tbody></table>');
        }).error(function(err) {
          preloader
          .hide()
          .find('> div')
          .removeClass('active');
          standingDOM.append('<h3 class="error">Error while fetching the data!</h3>');
          console.error(err);
        });
  }
  function scheduleTeam() {
    var url = new URLSearchParams(window.location.search);
    var param = url.get("id");
    var endpoint = "https://api.football-data.org/v2/teams/"+param+"/matches?status=SCHEDULED";
    const scheduleDOM = $('#schedule');
    const preloader = $('#preloader');
    let list = '';
    
    $.ajax({
      method: 'GET',
      headers: {
        "X-Auth-Token": "d767b16fae7e4b4d9a3abf8e483e4351"
      },
      url: endpoint,
    }).done(function(data) {
      if (!data) {
        preloader
          .hide()
          .find('> div')
          .removeClass('active');
          scheduleDOM.append('<h3>Error while fetching the data!</h3>');
        return;
      }

      data.matches.map(function(d) {
        list += scheduleTemplate(d, 0);
        return d;
      });

      console.log(data.matches);

      scheduleDOM.html(list);
      $('.btncard').click(function() {
        var position = $('.btncard').index(this);
        console.log(data.matches[position]);
        addToOffline(data.matches[position]);
      });
    }).error(function(err) {
      preloader
          .hide()
          .find('> div')
          .removeClass('active');
          scheduleDOM.append('<h3 class="error">Error while fetching the data!</h3>');
          console.error(err);
    });
  }
  
    return {
      getInstance: function() {
        if (!instance) {
          instance = init();
        }
  
        return instance;
      },
      getStanding: standingLeague,
      getScheduleTeam: scheduleTeam,
      showData: getAllDb
    }
  })();