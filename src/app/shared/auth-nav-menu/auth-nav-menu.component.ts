import { AuthMethod } from './../../core/auth/models/auth.method';
import { Observable, of as observableOf, Subscription } from 'rxjs';

import { filter, map, mergeMap, take } from 'rxjs/operators';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterReducerState } from '@ngrx/router-store';
import { select, Store } from '@ngrx/store';

import { fadeInOut, fadeOut } from '../animations/fade';
import { HostWindowService } from '../host-window.service';
import { AppState, routerStateSelector } from '../../app.reducer';
import { isNotNull, isNotUndefined } from '../empty.util';
import { getAuthenticationMethods, isAuthenticated, isAuthenticationLoading } from '../../core/auth/selectors';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { AuthService, LOGIN_ROUTE, LOGOUT_ROUTE } from '../../core/auth/auth.service';
import { AuthMethodType } from 'src/app/core/auth/models/auth.method-type';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';

@Component({
  selector: 'ds-auth-nav-menu',
  templateUrl: './auth-nav-menu.component.html',
  styleUrls: ['./auth-nav-menu.component.scss'],
  animations: [fadeInOut, fadeOut]
})
export class AuthNavMenuComponent implements OnInit {
  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;

  /**
   * True if the authentication is loading.
   * @type {boolean}
   */
  public loading: Observable<boolean>;

  public isXsOrSm$: Observable<boolean>;

  public showAuth = observableOf(false);

  public user: Observable<EPerson>;

  public sub: Subscription;

  public onlyOidc: Observable<boolean>

  constructor(private store: Store<AppState>,
              private windowService: HostWindowService,
              private authService: AuthService,
              @Inject(NativeWindowService) private _window: NativeWindowRef,
  ) {
    this.isXsOrSm$ = this.windowService.isXsOrSm();
  }

  ngOnInit(): void {
    // set isAuthenticated
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    // set loading
    this.loading = this.store.pipe(select(isAuthenticationLoading));

    this.user = this.authService.getAuthenticatedUserFromStore();

    this.showAuth = this.store.pipe(
      select(routerStateSelector),
      filter((router: RouterReducerState) => isNotUndefined(router) && isNotUndefined(router.state)),
      map((router: RouterReducerState) => (!router.state.url.startsWith(LOGIN_ROUTE)
        && !router.state.url.startsWith(LOGOUT_ROUTE))
      )
    );

    this.onlyOidc = this.store.pipe(
      select(getAuthenticationMethods),
      map((m: AuthMethod[]) => {
        return (m.length === 1 && m[0].authMethodType === AuthMethodType.Oidc)
      })
    )
  }

  redirectToOidc() {
    this.store.pipe(
      select(getAuthenticationMethods),
      mergeMap((methods: AuthMethod[]) => {
        return methods.filter((m: AuthMethod) => m.authMethodType === AuthMethodType.Oidc)
      }))
      .subscribe((m: AuthMethod) => {
        let newLocationUrl = m.location;

        const currentUrl = this._window.nativeWindow.location.href;
        const myRegexp = /\?redirectUrl=(.*)/g;
        const match = myRegexp.exec(newLocationUrl);
        const redirectUrl = (match && match[1]) ? match[1] : null;

        // Check whether the current page is different from the redirect url received from rest
        if (isNotNull(redirectUrl) && redirectUrl !== currentUrl) {
          // change the redirect url with the current page url
          const newRedirectUrl = `?redirectUrl=${currentUrl}`;
          newLocationUrl = newLocationUrl.replace(/\?redirectUrl=(.*)/g, newRedirectUrl);
        }
         // redirect to oidc authentication url
        this._window.nativeWindow.location.href = newLocationUrl;

      })
  }
}
