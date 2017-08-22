var util = require('../../utils/util.js')
var app = getApp();
Page({
  // RESTFul API JSON
  // SOAP XML
  //粒度 不是 力度
  data: {
    inTheaters: {},
    comingSoon: {},
    top250: {},
    searchResult: {},
    containerShow: true,
    searchPanelShow: false,
  },
    onShareAppMessage: function () {
    return {
      title: '光与影',
      desc: '进入搜索电影吧',
      path: '/pages/movies/movies'
    }
  },
  onLoad: function (event) {
    var inTheatersUrl = app.globalData.doubanBase +
      "/v2/movie/in_theaters" + "?start=0&count=6";
    var comingSoonUrl = app.globalData.doubanBase +
      "/v2/movie/coming_soon" + "?start=0&count=6";
    var top250Url = app.globalData.doubanBase +
      "/v2/movie/top250" + "?start=0&count=6";

    this.getMovieListData(inTheatersUrl, "inTheaters", "正在热映");
    this.getMovieListData(comingSoonUrl, "comingSoon", "即将上映");
    this.getMovieListData(top250Url, "top250", "豆瓣Top250");
    my.setNavigationBar({
          title: '光与影',
          color:"#fff",
          backgroundColor: '#314C6D'
    });
  },
  
  onMoreTap: function (event) {
    var category = event.currentTarget.dataset.category;
    my.navigateTo({
      url: "more-movie/more-movie?category=" + category
    })
  },

  onMovieTap:function(event){
    var movieId = event.currentTarget.dataset.movieId;
    // console.log(event.currentTarget)
    my.navigateTo({
      url: "movie-detail/movie-detail?id="+movieId
    })
  },

  getMovieListData: function (url, settedKey, categoryTitle) {
    my.showNavigationBarLoading()
    var that = this;
    my.httpRequest({
      url: url,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        that.processDoubanData(res.data, settedKey, categoryTitle)
      },
      fail: function (error) {
        // fail
        console.log(error)
      }
    })
  },

  onCancelImgTap: function (event) {
      this.setData({
        containerShow: true,
        searchPanelShow: false,
        searchResult:{}
      }
    )
  },

  onBindFocus: function (event) {
    this.setData({
      containerShow: false,
      searchPanelShow: true
    })
  },

  onBindBlur: function (event) {
    var text = event.detail.value;
    var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q=" + text;
    this.getMovieListData(searchUrl, "searchResult", "");
  },

  processDoubanData: function (moviesDouban, settedKey, categoryTitle) {
    var movies = [];
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }
      // [1,1,1,1,1] [1,1,1,0,0]
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      movies.push(temp)
    }
    var readyData = {};
    readyData[settedKey] = {
      categoryTitle: categoryTitle,
      movies: movies
    }
    this.setData(readyData);
    console.log(readyData)
    my.hideNavigationBarLoading();
  }
})