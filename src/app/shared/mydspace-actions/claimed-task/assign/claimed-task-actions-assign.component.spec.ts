import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { EPersonDataService } from 'src/app/core/eperson/eperson-data.service';
import { GroupDataService } from 'src/app/core/eperson/group-data.service';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { Group } from 'src/app/core/eperson/models/group.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { WorkflowItem } from 'src/app/core/submission/models/workflowitem.model';
import { WorkflowStep } from 'src/app/core/submission/models/workflowstep.model';
import { WorkflowItemDataService } from 'src/app/core/submission/workflowitem-data.service';
import { WorkflowStepDataService } from 'src/app/core/submission/workflowstep-data.service';
import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { NotificationsServiceStub } from 'src/app/shared/testing/notifications-service.stub';
import { createPaginatedList } from 'src/app/shared/testing/utils.test';
import { ClaimedTaskDataService } from '../../../../core/tasks/claimed-task-data.service';
import { ClaimedTask } from '../../../../core/tasks/models/claimed-task-object.model';
import { ProcessTaskResponse } from '../../../../core/tasks/models/process-task-response';
import { TranslateLoaderMock } from '../../../mocks/translate-loader.mock';
import { ClaimedTaskActionsAssignComponent } from './claimed-task-actions-assign.component';

let component: ClaimedTaskActionsAssignComponent;
let fixture: ComponentFixture<ClaimedTaskActionsAssignComponent>;
let modalService: NgbModal;

describe('ClaimedTaskActionsAssignComponent', () => {

  const object = Object.assign(new ClaimedTask(), {
    id: 'claimed-task-1',
    _links: {
      workflowitem : {href: 'workflow-item-href'},
      step : {href: 'step-href'}
    }
  });

  const collection = Object.assign(new Collection(), { uuid: 'collection-1' });

  const workflowItem = Object.assign(new WorkflowItem(), {
    uuid: 'workflow-item-1',
    _links: {
      collection : {href: 'collection-href'}
    }
  });

  const workflowStep = Object.assign(new WorkflowStep(), { roleId: 'editor' });

  const workflowGroup = Object.assign(new Group(), {
    uuid: 'group-1',
    _links: {
      allMembers : {href: 'allMembers-href'}
    }
  });

  const member1 = Object.assign(new EPerson(), { uuid: 'member-1' });
  const member2 = Object.assign(new EPerson(), { uuid: 'member-1' });
  const currentUser = Object.assign(new EPerson(), { uuid: 'currentUser' });

  const claimedTaskService = jasmine.createSpyObj('claimedTaskService', {
    submitTask: observableOf(new ProcessTaskResponse(true))
  });

  const collectionService = jasmine.createSpyObj('collectionService', {
    findByHref: createSuccessfulRemoteDataObject$(collection)
  });

  const workflowItemService = jasmine.createSpyObj('workflowItemService', {
    findByHref: createSuccessfulRemoteDataObject$(workflowItem)
  });

  const workflowStepService = jasmine.createSpyObj('workflowStepService', {
    findByHref: createSuccessfulRemoteDataObject$(workflowStep)
  });

  const groupService = jasmine.createSpyObj('groupService', {
    searchBy: createSuccessfulRemoteDataObject$(createPaginatedList([workflowGroup]))
  });

  const ePersonService = jasmine.createSpyObj('ePersonService', {
    findAllByHref: createSuccessfulRemoteDataObject$(createPaginatedList([member1, member2]))
  });

  const authService = jasmine.createSpyObj('authService', {
    getAuthenticatedUserFromStore: observableOf(currentUser)
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgbModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })
      ],
      declarations: [ClaimedTaskActionsAssignComponent],
      providers: [
        { provide: ClaimedTaskDataService, useValue: claimedTaskService },
        { provide: CollectionDataService, useValue: collectionService },
        { provide: WorkflowItemDataService, useValue: workflowItemService },
        { provide: WorkflowStepDataService, useValue: workflowStepService },
        { provide: GroupDataService, useValue: groupService },
        { provide: EPersonDataService, useValue: ePersonService },
        { provide: AuthService, useValue: authService },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        FormBuilder,
        NgbModal
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ClaimedTaskActionsAssignComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimedTaskActionsAssignComponent);
    component = fixture.componentInstance;
    modalService = TestBed.get(NgbModal);
    component.object = object;
    component.modalRef = modalService.open('ok');
    fixture.detectChanges();
  });

  it('should init assign form properly', () => {
    expect(component.assignForm).toBeDefined();
    expect(component.assignForm instanceof FormGroup).toBeTruthy();
    expect(component.assignForm.controls.user).toBeDefined();
  });

  it('should display assign button', () => {
    const btn = fixture.debugElement.query(By.css('.btn-info'));
    expect(btn).toBeDefined();
  });

  it('should display spin icon when assign is pending', () => {
    component.processing$.next(true);
    fixture.detectChanges();

    const span = fixture.debugElement.query(By.css('.btn-assign .fa-spin'));
    expect(span).toBeDefined();
  });

  it('should call openAssignModal on assign button click', async(() => {
    spyOn(component.assignForm, 'reset');
    const btn = fixture.debugElement.query(By.css('.btn-info'));
    btn.nativeElement.click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(component.assignForm.reset).toHaveBeenCalled();
      expect(component.modalRef).toBeDefined();
      component.modalRef.close()
    });

  }));

  it('on form submit should call claimedTaskService\'s submitTask with the expected body', async(() => {

    spyOn(component.processCompleted, 'emit');

    const expectedBody = {
      [component.option]: 'true',
      user: null
    };

    const btn = fixture.debugElement.query(By.css('.btn-info'));
    btn.nativeElement.click();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.modalRef).toBeDefined();

      const form = ((document as any).querySelector('form'));
      form.dispatchEvent(new Event('ngSubmit'));
      fixture.detectChanges();

      expect(claimedTaskService.submitTask).toHaveBeenCalledWith(object.id, expectedBody);
      expect(component.processCompleted.emit).toHaveBeenCalledWith(true);
    });

  }));

});
