// pages/movies/more-movie/more-movie.js
var app = getApp()
var util = require('../../../utils/util.js')
Page({
  data: {
    movies: [],
    navigateTitle: "",
    requestUrl: "",
    totalCount: 0,
    isEmpty: true,
    hiddenLoading:false,
    disabledRemind:false
  },
  onLoad: function (options) {
    var category = options.category;
    this.data.navigateTitle = category;
    var dataUrl = "";
    switch (category) {
      case "正在热映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/in_theaters";
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/coming_soon";
        break;
      case "豆瓣Top250":
        dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
        break;
    }
     my.setNavigationBar({
          title: category,
          color:"#fff",
          backgroundColor: '#314C6D'
    })
    this.data.requestUrl = dataUrl;
    console.log(this.data.requestUrl)
    // util.http(dataUrl, this.processDoubanData)
    var that = this
    var url = dataUrl
    my.httpRequest({
      url: url,
      method: 'GET',
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        that.processDoubanData(res.data)
        // console.log(res.data)
      },
      fail: function (error) {
        // fail
        console.log(error)
      }
    })
  },
  onPullDownRefresh: function (event) {
    var refreshUrl = this.data.requestUrl +
      "?star=0&count=20"
    this.data.movies = {};
    this.data.isEmpty = true;
    this.data.totalCount = 0;
    // console.log(refreshUrl)
    util.http(refreshUrl, this.processDoubanData);
    my.showNavigationBarLoading();
  },
  onReachBottom: function (event) {
    // 上滑加载
    var nextUrl = this.data.requestUrl +
      "?start=" + this.data.totalCount + "&count=20";
    console.log(123)
    var that=this
    my.httpRequest({
      url: nextUrl,
      method: 'GET',
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        that.processDoubanData(res.data)
        // console.log(res.data)
      },
      fail: function (error) {
        // fail
        console.log(error)
      }
    })
    my.showNavigationBarLoading()
  },
  processDoubanData: function (moviesDouban) {
    var movies = [];
    //没有更多啦
    if(moviesDouban.subjects.length<=0){
      var _this = this;
      if(!_this.data.disabledRemind){
        _this.setData({
          disabledRemind: true
        });
        setTimeout(function(){
          _this.setData({
            disabledRemind: false
          });
        }, 2000);
      }
    }
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
    var totalMovies = {}

    //如果要绑定新加载的数据，那么需要同旧有的数据合并在一起
    if (!this.data.isEmpty) {
      totalMovies = this.data.movies.concat(movies);
    }
    else {
      totalMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies
    });
    this.data.totalCount += 20;
    my.hideNavigationBarLoading();
    my.stopPullDownRefresh()
    this.setData({
      hiddenLoading:true
    })
  },

  onReady: function (event) {
    my.setNavigationBar({
      title: this.data.navigateTitle
    })
  },

  onMovieTap: function (event) {
    var movieId = event.currentTarget.dataset.movieid;
    my.navigateTo({
      url: '../movie-detail/movie-detail?id=' + movieId
    })
  },
})