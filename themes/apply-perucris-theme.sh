#!/bin/bash
mv src/app/+home-page/home-news/home-news.component.html  themes/peru-cris/app/+home-page/home-news/home-news.component.html.orig
mv src/app/header/header.component.html themes/peru-cris/app/header/header.component.html.orig
mv src/app/footer/footer.component.html themes/peru-cris/app/footer/footer.component.html.orig
mv src/app/header-nav-wrapper/header-navbar-wrapper.component.html themes/peru-cris/app/header-nav-wrapper/header-navbar-wrapper.component.html.orig
mv themes/default/styles/_themed_bootstrap_variables.scss themes/peru-cris/styles/_themed_bootstrap_variables.scss.orig
\cp themes/peru-cris/app/+home-page/home-news/home-news.component.html src/app/+home-page/home-news/home-news.component.html 
\cp themes/peru-cris/app/header/header.component.html src/app/header/header.component.html
\cp themes/peru-cris/app/footer/footer.component.html src/app/footer/footer.component.html
\cp themes/peru-cris/app/header-nav-wrapper/header-navbar-wrapper.component.html src/app/header-nav-wrapper/header-navbar-wrapper.component.html
\cp themes/peru-cris/styles/_themed_bootstrap_variables.scss themes/default/styles/_themed_bootstrap_variables.scss
