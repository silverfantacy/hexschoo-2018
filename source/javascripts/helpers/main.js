$(document).ready(function () {
  $(window).scroll(function () {
    var scrollPos = $(window).scrollTop();
    var windowHeight = $(window).height();
    // console.log(scrollPos, windowHeight);
    $('.show-js').each(function () {
      var thisPos = $(this).offset().top;
      if ((windowHeight + scrollPos) >= thisPos) {
        // console.log('show-js' + thisPos);
        $(this).addClass('fadeIn');
      }
    })
  })
})