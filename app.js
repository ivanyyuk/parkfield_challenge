'use strict';

//this prevents menu from being hidden when we chage the size of the page
//because when we have a hamburger menu we use jquery toggle() that adds dispay:none property
//and overrides our media queries
$(window).on('resize',function(){
    if($(this).width() > 849){
        $('.filter').removeAttr('style');
    }
});

/*
 * START HELPER METHODS
 *
 *
 */
const loadPosts = function() {
  return axios.get('posts.json')
    .then(function (res) {
      return res.data;
    })
    .catch(console.error);
};

const loadAndAttachPosts = function () {
  return loadPosts()
    .then(function(data) {
      $.each(data.items, function(key, val){
        let post = createFromServiceName(val.service_name, val.item_data);
        $(post).appendTo('#posts');
      });
    });
};

//this function has to be a little different so we can retain 
//any current filter
//we load posts, attach them then if there is a filter
//we remove all filters and re activate that same filter
const loadMorePosts = function() {
  const activeFilter = $('.active').attr('id');
  return loadAndAttachPosts()
    .then(function() {
      if (activeFilter){
        let id = activeFilter.split('-')[1];
        removeOtherActiveClasses();
        $(`#${activeFilter}`).toggleClass('active');
        toggleFilter(id, false);
      }
    });
};

const addClickHandlers = function (){
  $('.hamburger').on('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    $('.filter').toggle();
  });

  $('.filter li').each(function() {
    $(this).on('click',
      function() {
        //get the name of posts we want to show
        //id is filter-manual filter-twitter etc.
        //so we only want the second word
        let id = $(this).attr('id').split('-')[1];

        //now we check if the filter is already active
        //and pass that to our filter function
        let isActive = $(this).hasClass('active');

        //remove all other active classes
        removeOtherActiveClasses(id);

        //toggle the class
        $(this).toggleClass('active');

        //then we filter the posts
        toggleFilter(id, isActive);
      });
  });

  //this activated our load more posts link to load posts and open all
  //new links in new windows
  $('#load-link').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    loadMorePosts().then(linksInNewWindow);
  });
};


const linksInNewWindow = function () {
  $('a').each(function() {
    var a = new RegExp('/' + window.location.host + '/');
    if(!a.test(this.href)) {
      $(this).click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        window.open(this.href, '_blank');
      });
    }
  });
};



//this is for manual posts because the link string had unnecessary expace characters
const replaceEscapeCharacters = function (str) {
  return str.replace(/\\/g, '');
};

//used in parseLinksAndHashTags
const addAnchorToUrl = function (str) {
  return `<a href='${str}'>${str}</a>`;
};

//used in parseLinksandHastags
const addAnchorToAtMention = function (str) {
  return `<a href='https://twitter.com/${str}'>${str}</a>`;
};

//used in parseLinksandHastags
const addAnchorToTwitterHashtag = function (str) {
  return `<a href='https://twitter.com/hashtag/${str.slice(1)}'>${str}</a>`;
};

//used in parseInstagramTags
const addAnchorToInstagramHashTag = function (str) {
  return `<a href='https://instagram.com/explore/tags/${str.slice(1)}'>${str}</a>`;
};

//used in createTwitterPost
const parseLinksAndHashTags = function(tweet) {
  const linkReg = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/ig;
  const atMentionReg = /\B\@([\w\-]+)/gim;
  const hashtagReg = /\B\#([\w\-]+)/gim;

  tweet = tweet.replace(linkReg, addAnchorToUrl);
  tweet = tweet.replace(atMentionReg, addAnchorToAtMention);
  tweet = tweet.replace(hashtagReg, addAnchorToTwitterHashtag);

  return tweet;
};

const parseInstagramTags = function (str) {
  const hashtagReg = /\B\#([\w\-]+)/gim;
  return str.replace(hashtagReg, addAnchorToInstagramHashTag);
};

const createManualPost = function (postData) {
  const divHtml = ` <div class='post manual-post'>
    <i class="badge fa fa-square" aria-hidden="true"></i>
<img src='${postData.image_url}' />
    <div class='content'>
    <div class='text'><span>${postData.text}</span></div>
    <div class='manual-link'><span><a href='${postData.link}'>${postData.link_text}</a></span></div>
    </div>
  </div> 
    `;

    return divHtml;
};

const createTwitterPost = function (postData) {
  const tweet = parseLinksAndHashTags(postData.tweet);

  const divHtml = ` <div class='post twitter-post'>
    <i class="badge fa fa-twitter-square" aria-hidden="true"></i>
    <div class='username'><h3>${postData.user.username}</h3></div>
    <div class='content'>
    <div class='tweet'><span>${tweet}</span></div>
    </div>
  </div> 
    `;

    return divHtml;
};

const createInstagramPost = function (postData) {
  const caption =  parseInstagramTags(postData.caption);

  const divHtml = ` <div class='post instagram-post'>
    <i class="badge fa fa-instagram" aria-hidden="true"></i>
    <div class='image'>
<img src='${postData.image.medium}' /></div>
    <div class='content'>
    <div class='caption'><span>${caption}</span></div>
    </div>
  </div> 
    `;

    return divHtml;

};

const createFromServiceName = function (name, postData) {
  switch(name) {
    case 'Manual':
      return createManualPost(postData);
    case 'Twitter':
      return  createTwitterPost(postData);
    case 'Instagram':
      return  createInstagramPost(postData);
    default:
      throw Error('case not found', name);
  }
};

const toggleFilter = function (id, isActive) {

  //clear classes first
  $('.hidden').removeClass('hidden');

  //if filter was active all we need to do is clear classes and return
  if (isActive) return;





  const classes = ['manual', 'twitter', 'instagram'];

  //splice out the class we will show
  classes.forEach(function(currentClass, i) {
    if (currentClass === id) {
      classes.splice(i,1);
      return;
    }
  });


  //our classes array will only have the classes to hide
  classes.forEach(function(currentClass){
    let classString = `.${currentClass}-post`;
    $(classString).addClass('hidden');
  });
};

const removeOtherActiveClasses = function (id) {

  const ids = ['manual', 'twitter', 'instagram'];

  //basically go through all other filter ids and remove
  //active class if it exists
  ids.forEach(function(currentId) {
    if (id !== currentId) {
      $(`#filter-${currentId}`).removeClass('active');
    }
  });
};

/*
 *
 *
 * END HELPER METHODS
 *
 *
 *
 */

$(function() {
  loadAndAttachPosts()
  .then(addClickHandlers)
  .then(linksInNewWindow)
  .catch(console.error);
});

