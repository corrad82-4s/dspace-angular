#!/bin/bash
rm -f src/app/+home-page/home-news/home-news.component.html 
rm -f src/app/header/header.component.html
rm -f src/app/footer/footer.component.html
rm -f src/app/header-nav-wrapper/header-navbar-wrapper.component.html
rm -f themes/default/styles/_themed_bootstrap_variables.scss
mv themes/peru-cris/app/+home-page/home-news/home-news.component.html.orig src/app/+home-page/home-news/home-news.component.html 
mv themes/peru-cris/app/header/header.component.html.orig src/app/header/header.component.html
mv themes/peru-cris/app/footer/footer.component.html.orig src/app/footer/footer.component.html
mv themes/peru-cris/app/header-nav-wrapper/header-navbar-wrapper.component.html.orig src/app/header-nav-wrapper/header-navbar-wrapper.component.html
mv themes/peru-cris/styles/_themed_bootstrap_variables.scss.orig themes/default/styles/_themed_bootstrap_variables.scss
