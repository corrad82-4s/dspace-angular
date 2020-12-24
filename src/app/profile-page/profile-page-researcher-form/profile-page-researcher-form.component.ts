import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { ResearcherProfile } from 'src/app/core/profile/model/researcher-profile.model';
import { ResearcherProfileService } from 'src/app/core/profile/researcher-profile.service';
import {mergeMap, take} from 'rxjs/operators';
import {ProfileClaimService} from '../profile-claim/profile-claim.service';
import {ClaimItemSelectorComponent} from '../../shared/dso-selector/modal-wrappers/claim-item-selector/claim-item-selector.component';

@Component({
    selector: 'ds-profile-page-researcher-form',
    templateUrl: './profile-page-researcher-form.component.html'
  })
/**
 * Component for a user to create/delete or change his researcher profile.
 */
export class ProfilePageResearcherFormComponent implements OnInit {

    /**
     * The user to display the form for.
     */
    @Input()
    user: EPerson;

    /**
     * The researcher profile to show.
     */
    researcherProfile$: BehaviorSubject<ResearcherProfile> = new BehaviorSubject<ResearcherProfile>( null );

    /**
     * A boolean representing if a delete operation is pending
     * @type {BehaviorSubject<boolean>}
     */
    processingDelete$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /**
     * A boolean representing if a create delete operation is pending
     * @type {BehaviorSubject<boolean>}
     */
    processingCreate$: BehaviorSubject<boolean>  = new BehaviorSubject<boolean>(false);

    canClaim$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

    constructor( protected researcherProfileService: ResearcherProfileService,
                 protected router: Router, private claimService: ProfileClaimService,
                 private modalService: NgbModal) {

    }

    /**
     * Initialize the component searching the current user researcher profile.
     */
    ngOnInit(): void {

        this.researcherProfileService.findById(this.user.id)
        .pipe(
            take(1),
            mergeMap((rp: ResearcherProfile) => {
                if (rp != null) {
                    this.researcherProfile$.next(rp);
                }
                return of(rp != null);
            }),
            mergeMap((profileFound: boolean) => {
                if (profileFound) {
                    return of(false);
                }
                return this.claimService.canClaimProfiles(this.user);
            })
        )
        .subscribe((canClaim: boolean) => {
            this.canClaim$.next(canClaim);
        })
    }

    /**
     * Create a new profile for the current user.
     */
    createProfile(): void {
        this.processingCreate$.next(true);
        this.researcherProfileService.create()
            .subscribe ( (researcherProfile) => {
                this.researcherProfile$.next(researcherProfile);
                this.processingCreate$.next(false);
            });
    }

    claim(): void {
        const modal = this.modalService.open(ClaimItemSelectorComponent);
        modal.componentInstance.dso = this.user;
    }

    /**
     * Navigate to the items section to show the profile item details.
     *
     * @param researcherProfile the current researcher profile
     */
    viewProfile( researcherProfile: ResearcherProfile ): void {
        this.researcherProfileService.findRelatedItemId(researcherProfile)
            .subscribe( (itemId) => {
                if (itemId != null) {
                    this.router.navigate(['items',itemId]);
                }
            });
    }

    /**
     * Delete the given researcher profile.
     *
     * @param researcherProfile the profile to delete
     */
    deleteProfile( researcherProfile: ResearcherProfile): void {
        this.processingDelete$.next(true);
        this.researcherProfileService.delete(researcherProfile)
            .subscribe ( (deleted) => {
                if ( deleted ) {
                    this.researcherProfile$.next(null);
                }
                this.processingDelete$.next(false);
            });
        this.claimService.canClaimProfiles(this.user)
          .subscribe((canClaim: boolean) => this.canClaim$.next(canClaim));
    }

    /**
     * Toggle the visibility of the given researcher profile.
     *
     * @param researcherProfile the profile to update
     */
    toggleProfileVisibility(researcherProfile: ResearcherProfile): void {
        this.researcherProfileService.setVisibility(researcherProfile, !researcherProfile.visible)
            .subscribe ( (updatedProfile) => this.researcherProfile$.next(updatedProfile));
    }

    /**
     * Return a boolean representing if a delete operation is pending.
     *
     * @return {Observable<boolean>}
     */
    isProcessingDelete(): Observable<boolean> {
        return this.processingDelete$.asObservable();
    }

    /**
     * Return a boolean representing if a create operation is pending.
     *
     * @return {Observable<boolean>}
     */
    isProcessingCreate(): Observable<boolean> {
        return this.processingCreate$.asObservable();
    }

    canClaim(): Observable<boolean> {
        return this.canClaim$.asObservable();
    }

}