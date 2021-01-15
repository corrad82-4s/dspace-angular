import { isNotEmpty, isNotNull } from 'src/app/shared/empty.util';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AuthMethod } from '../../core/auth/models/auth.method';
import {
  getAuthenticationError,
  getAuthenticationMethods,
  isAuthenticated,
  isAuthenticationLoading
} from '../../core/auth/selectors';
import { CoreState } from '../../core/core.reducers';
import { getForgotPasswordRoute, getRegisterRoute } from '../../app-routing-paths';
import { hasValue, isNotUndefined } from '../empty.util';
import { AuthService } from '../../core/auth/auth.service';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
import { map } from 'rxjs/operators';
import { AuthMethodType } from 'src/app/core/auth/models/auth.method-type';
import { NativeWindowRef, NativeWindowService } from 'src/app/core/services/window.service';
import { Router } from '@angular/router';

/**
 * /users/sign-in
 * @class LogInComponent
 */
@Component({
  selector: 'ds-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements OnInit {

  /**
   * A boolean representing if LogInComponent is in a standalone page
   * @type {boolean}
   */
  @Input() isStandalonePage: boolean;

  /**
   * The list of authentication methods available
   * @type {AuthMethod[]}
   */
  public authMethods: Observable<AuthMethod[]>;

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

  /**
   * Whether or not the current user (or anonymous) is authorized to register an account
   */
  canRegister$: Observable<boolean>;

  constructor(private store: Store<CoreState>,
              private authService: AuthService,
              private authorizationService: AuthorizationDataService,
              @Inject(NativeWindowService) private _window: NativeWindowRef) {
  }

  ngOnInit(): void {

    this.authMethods = this.store.pipe(
      select(getAuthenticationMethods),
    );

    // set loading
    this.loading = this.store.pipe(select(isAuthenticationLoading));

    // set isAuthenticated
    this.isAuthenticated = this.store.pipe(select(isAuthenticated));

    // Clear the redirect URL if an authentication error occurs and this is not a standalone page
    this.store.pipe(select(getAuthenticationError)).subscribe((error) => {
      if (hasValue(error) && !this.isStandalonePage) {
        this.authService.clearRedirectUrl();
      }
    });

    this.canRegister$ = this.authorizationService.isAuthorized(FeatureID.EPersonRegistration);

    this.authMethods.pipe(
      map((methods: AuthMethod[]) => {
        if (methods.length === 1 && methods[0].authMethodType === AuthMethodType.Oidc) {
          return methods[0];
        }
        return undefined;
      }),
      map((method: AuthMethod) => {
        if (isNotUndefined(method)) {
          return method.location;
        }
        return '';
      })
    )
      .subscribe((location: string) => {
        if (isNotEmpty(location)) {
          this.redirectToOidc(location);
        }
      });
  }

  getRegisterRoute() {
    return getRegisterRoute();
  }

  getForgotRoute() {
    return getForgotPasswordRoute();
  }

  private redirectToOidc(location: string) {
    this._window.nativeWindow.location.href = location;
  }
}
