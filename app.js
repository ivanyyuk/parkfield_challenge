'use strict';

const loadPosts = function() {
  return axios.get('posts.json')
    .then(function (res) {
      return res.data;
    })
    .catch(console.error);
};

const replaceEscapeCharacters = function (str) {
  return str.replace(/\\/g, '');
};

const addAnchorToUrl = function (str) {
  return `<a href='${str}'>${str}</a>`;
};

const addAnchorToAtMention = function (str) {
  return `<a href='https://twitter.com/${str}'>${str}</a>`;
};

const addAnchorToTwitterHashtag = function (str) {
  return `<a href='https://twitter.com/hashtag/${str.slice(1)}'>${str}</a>`;
};

const addAnchorToInstagramHashTag = function (str) {
  return `<a href='https://instagram.com/explore/tags/${str.slice(1)}'>${str}</a>`;
};


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
    <div class='image'><img src='${postData.image.medium}' /></div>
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


$(function() {
  loadPosts()
    .then(function(data) {
      $.each(data.items, function(key, val){
        let post = createFromServiceName(val.service_name, val.item_data);
        $(post).appendTo('#posts');
      });

      //add property to all links so they open in new window
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
    });
});

