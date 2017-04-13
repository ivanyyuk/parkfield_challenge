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

const createFromServiceName = function (name) {
  console.log(name);
};


$(function() {
  loadPosts()
    .then(function(data) {
      const posts = [];
      $.each(data.items, function(key, val){
        createFromServiceName(val.service_name);
        let post = '<div class="individual-product"> ' + val + ' </div>';
        $(post).appendTo('#products');
      });
    });
});

