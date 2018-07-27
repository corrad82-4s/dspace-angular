import { Component, Input, OnInit } from '@angular/core';
import { GroupEpersonService } from '../../../../core/eperson/group-eperson.service';
import { ResourcePolicy } from '../../../../core/shared/resource-policy.model';
import { isEmpty } from '../../../../shared/empty.util';
import { EpersonData } from '../../../../core/eperson/eperson-data';
import { Group } from '../../../../core/eperson/models/group.model';

@Component({
  selector: 'ds-access-conditions',
  templateUrl: './accessConditions.component.html',
})
export class AccessConditionsComponent implements OnInit {

  @Input() accessConditions: ResourcePolicy[];

  public accessConditionsList = [];

  constructor(private groupService: GroupEpersonService) {}

  ngOnInit() {
    this.accessConditions.forEach((accessCondition: ResourcePolicy) => {
      if (isEmpty(accessCondition.name)) {
        this.groupService.getDataByUuid(accessCondition.groupUUID)
          .subscribe((data: EpersonData) => {
            const group = data.payload[0] as any;
            const accessConditionEntry = Object.assign({}, accessCondition);
            accessConditionEntry.name = group.name;
            this.accessConditionsList.push(accessConditionEntry);
          })
      } else {
        this.accessConditionsList.push(accessCondition);
      }
    })
  }
}