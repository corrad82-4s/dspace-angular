import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { SearchResult } from 'src/app/shared/search/search-result.model';
import { createPaginatedList } from 'src/app/shared/testing/utils.test';
import { PaginatedList } from 'src/app/core/data/paginated-list';
import { getRemoteDataPayload } from './../../core/shared/operators';
import { getAllSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { TestBed } from '@angular/core/testing';
import { ProfileClaimService } from 'src/app/profile-page/profile-claim/profile-claim.service';
import { Item } from 'src/app/core/shared/item.model';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';

xdescribe('ProfileClaimService', () => {

    let service: ProfileClaimService;
    let searchService: SearchService;
    let ePerson: EPerson;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [],
            providers: [
                ProfileClaimService
            ],
        });
        service = TestBed.get(ProfileClaimService);

        searchService = (service as any).searchService;
    });

    describe('when person has an identifier', () => {
        beforeEach(() => {
            ePerson = Object.assign(new EPerson(), {
                metadata: {
                    'perucris.eperson.dni': [
                        {
                            language: null,
                            value: '123123'
                        }
                    ],
                    'perucris.eperson.orcid': [
                        {
                            language: null,
                            value: '0000-1111-2222-3333'
                        }
                    ]
                }
            })
        });

        it('when identifier matches profile can be claimed', () => {
        
            const person = Object.assign(new SearchResult(), {uuid: 'test-uuid'})
            const obj = new PaginatedList(new PageInfo(), [person]);
            spyOn(searchService, 'search').and.returnValue(createSuccessfulRemoteDataObject$(obj))
            
            const canClaim$ = service.canClaimProfiles(ePerson);
            canClaim$.subscribe((claimable: boolean) => expect(claimable).toBe(true));
            
            expect(searchService.search).toHaveBeenCalled();
        })

        describe('when identifier does not match', () => {

            it('profile cannot be claimed', () => {

            })
        })
    })

    describe('when person does not have an identifier', () => {

        it('cannot claim profile', () => {

        })

        it('search is not performed', () => {

        })
    })

    it('foo', () => {
        service.canClaimProfiles(eperson);
    })
});
});