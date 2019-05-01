(function ($) {
  // Search ------------
  var $searchWrap = $('.search-form-wrap'),
    isSearchAnim = false,
    searchAnimDuration = 200;

  var startSearchAnim = function () {
    isSearchAnim = true;
  };

  var stopSearchAnim = function (callback) {
    setTimeout(function () {
      isSearchAnim = false;
      callback && callback();
    }, searchAnimDuration);
  };

  $('.nav-item-search').on('click', function () {
    if (isSearchAnim) return;
    startSearchAnim();
    $searchWrap.addClass('on');
    stopSearchAnim(function () {
      $('.local-search-input').focus();
    });
  });

  $(document).mouseup(function (e) {
    var _con = $('.local-search');
    if (!_con.is(e.target) && _con.has(e.target).length === 0) {
      $searchWrap.removeClass('on');
    }
  });

  // 移动设备侦测
  var isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };
  searchFunc("/search.xml", 'local-search-input', 'local-search-result');

  $(document).ready(function ($) {
    $(".anchor").click(function (event) {
      event.preventDefault();
      $('html,body').animate({scrollTop: $(this.hash).offset().top}, 500);
    });
  });

  // Mobile nav
  var $content = $('.content'),
    $sidebar = $('.sidebar'),
    isMobileNavAnim = false,
    mobileNavAnimDuration = 200;

  var startMobileNavAnim = function () {
    isMobileNavAnim = true;
  };

  var stopMobileNavAnim = function () {
    setTimeout(function () {
      isMobileNavAnim = false;
    }, mobileNavAnimDuration);
  };

  $('.navbar-toggle').on('click', function () {
    if (isMobileNavAnim) return;
    startMobileNavAnim();
    $content.toggleClass('on');
    $sidebar.toggleClass('on');
    stopMobileNavAnim();
  });

  $($content).on('click', function () {
    if (isMobileNavAnim || !$content.hasClass('on')) return;
    $content.removeClass('on');
    $sidebar.removeClass('on');
  });

})(jQuery);
