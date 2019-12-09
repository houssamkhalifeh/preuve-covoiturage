import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';

import { CampaignService } from '~/modules/campaign/services/campaign.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { RulesRangeUxType } from '~/core/types/campaign/rulesRangeInterface';
import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignFormatingService } from '~/modules/campaign/services/campaign-formating.service';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent extends DestroyObservable implements OnInit {
  @Input() campaignId: number;
  @Input() parentId: number;
  @Input() section: number;

  helpCard = {
    svgIcon: 'new_car',
    title: 'Vous êtes nouveau sur Preuve de covoiturage ?',
    hint: 'Découvrez comment développer une politique de covoiturage efficace dans votre collectivité',
    link: 'https://registre-preuve-de-covoiturage.gitbook.io/produit/boite-a-outils/guide-des-incitations',
  };

  creationFromScratch = false;
  creationFromParentId = false;

  campaignFormGroup: FormGroup;
  requestLoading = false;
  loading = true;
  currentStep = 0;
  matStepperCompleted = false;

  private _defaultRange: RulesRangeUxType = [0, CAMPAIGN_RULES_MAX_DISTANCE_KM];
  @ViewChild('stepper', { static: false }) _matStepper: MatStepper;

  constructor(
    private _dialog: DialogService,
    private _formBuilder: FormBuilder,
    private _campaignService: CampaignService,
    private _campaignFormatService: CampaignFormatingService,
    private _toastr: ToastrService,
    private _router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.initForms();

    if (this.campaignId) {
      this.loadCampaign(this.campaignId);
    } else if (this.parentId) {
      this.creationFromParentId = true;
      // todo: get date range
      // todo: reproduce same date range in duplicate
      this.loadCampaign(this.parentId, true);
    } else {
      this.creationFromScratch = true;
      this.loading = false;
    }
  }

  public get controls() {
    return this.campaignFormGroup.controls;
  }

  get showFirstPageNextStep() {
    return this.campaignFormGroup.controls.parent_id.value || this.campaignFormGroup.controls._id.value;
  }

  get canGoToThirdStep(): boolean {
    const filtersFormGroup = this.campaignFormGroup.get('filters');

    const targetValid =
      this.campaignFormGroup.get('ui_status').get('for_trip').value ||
      this.campaignFormGroup.get('ui_status').get('for_passenger').value ||
      this.campaignFormGroup.get('ui_status').get('for_driver').value;

    return (
      targetValid &&
      filtersFormGroup.get('weekday').valid &&
      filtersFormGroup.get('distance_range').valid &&
      filtersFormGroup.get('rank').valid &&
      filtersFormGroup.get('insee').valid &&
      filtersFormGroup.get('operator_ids').valid &&
      this.campaignFormGroup.get('only_adult').valid
    );
  }

  get canGoToLastStep(): boolean {
    return (
      this.campaignFormGroup.get('filters').valid &&
      this.campaignFormGroup.get('max_amount').valid &&
      this.campaignFormGroup.get('max_trips').valid &&
      this.campaignFormGroup.get('start').valid &&
      this.campaignFormGroup.get('end').valid &&
      this.campaignFormGroup.get('unit').valid &&
      this.campaignFormGroup.get('restrictions').valid &&
      this.campaignFormGroup.get('retributions').valid
    );
  }

  saveCampaign() {
    const campaignUx = _.cloneDeep(this.campaignFormGroup.getRawValue());
    const campaign: Campaign = this._campaignFormatService.toCampaignFormat(campaignUx);
    if (campaign._id) {
      this.patchCampaign(campaign);
    } else {
      this.createCampaign(campaign);
    }
  }

  private patchCampaign(campaign: Campaign) {
    this._campaignService
      .patchList(campaign)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const campaignPatched = data[0];
          this.requestLoading = false;
          this._router.navigate([`/campaign/draft/${campaign._id}`]).then(() => {
            this._toastr.success(`La campagne ${campaignPatched.name} a bien été mise à jour`);
          });
        },
        (error) => {
          this.requestLoading = false;
          console.error(error);
          this._toastr.error('Une erreur est survenue lors de la mise à jour de la campagne');
        },
      );
  }

  private createCampaign(campaign: Campaign) {
    this._campaignService
      .createList(campaign)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          const campaignSaved = data[0];
          this.requestLoading = false;
          this._toastr.success(`La campagne ${campaignSaved.name} a bien été enregistrée`);
          this._router.navigate(['/campaign']);
        },
        (error) => {
          this.requestLoading = false;
          console.error(error);
          this._toastr.error("Une erreur est survenue lors de l'enregistrement de la campagne");
        },
      );
  }

  private initForms() {
    this.campaignFormGroup = this._formBuilder.group({
      _id: [null],
      name: [null, Validators.required],
      description: [null],
      status: [],
      filters: this._formBuilder.group({
        weekday: [null, Validators.required],
        time: this._formBuilder.array([]),
        distance_range: [this._defaultRange, Validators.required],
        rank: [null, Validators.required],
        operator_ids: [[], Validators.required],
        insee: this._formBuilder.group({
          whiteList: this._formBuilder.array([]),
          blackList: this._formBuilder.array([]),
        }),
      }),
      only_adult: [null],
      ui_status: this._formBuilder.group({
        for_driver: [null],
        for_passenger: [null],
        for_trip: [null],
        staggered: [false],
      }),
      start: [null, Validators.required],
      end: [null, Validators.required],
      max_amount: [null, [Validators.required, Validators.min(1)]],
      unit: [null, Validators.required],
      max_trips: [null, Validators.min(1)],
      parent_id: [null],
      restrictions: this._formBuilder.array([]),
      retributions: this._formBuilder.array([]),
    });
  }

  public initCampaign() {
    this.campaignFormGroup.setValue(new CampaignUx());
  }

  public setTemplate(templateId: number | null = null) {
    let campaign = new CampaignUx();

    if (templateId) {
      // get template from service
      campaign = this._campaignFormatService.toCampaignUxFormat({
        ...this._campaignService.getLoadedTemplate(templateId),
        _id: null,
        parent_id: templateId,
      });
    } else {
      // new campagn from scratch with default values
      campaign.filters.rank = [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C];
    }

    // load it
    this.setCampaignToForm(campaign, true);
  }

  private setCampaignToForm(campaign: CampaignUx, isTemplate = false) {
    // patch main
    this.campaignFormGroup.patchValue({
      _id: isTemplate ? null : campaign._id,
      parent_id: campaign.parent_id,
      status: isTemplate ? CampaignStatusEnum.DRAFT : campaign.status,
      name: campaign.name,
      description: campaign.description,
      start: campaign.start,
      // todo: (temp ) start: isTemplate ? null : campaign.start,
      end: isTemplate ? null : campaign.end,
      max_trips: campaign.max_trips,
      max_amount: campaign.max_amount,
      unit: campaign.unit,
    });

    // patch rules
    const filtersForm = this.campaignFormGroup.get('filters');
    filtersForm.patchValue({
      weekday: campaign.filters.weekday,
      distance_range: campaign.filters.distance_range,
      rank: campaign.filters.rank,
      operator_ids: campaign.filters.operator_ids,
    });

    // patch uiStatus
    const uiStatusForm = this.campaignFormGroup.get('ui_status');
    uiStatusForm.patchValue({
      for_driver: campaign.ui_status.for_driver,
      for_passenger: campaign.ui_status.for_passenger,
      for_trip: campaign.ui_status.for_trip,
      // initialize staggered
      staggered: campaign.ui_status.staggered !== null ? campaign.ui_status.staggered : false,
    });

    // patch form arrays
    const timeFormArray = <FormArray>filtersForm.get('time');
    timeFormArray.clear();
    campaign.filters.time.forEach((time) => {
      timeFormArray.push(this._formBuilder.control(time));
    });

    // patch insee filter
    const blackListFormArray = <FormArray>filtersForm.get('insee').get('blackList');
    blackListFormArray.clear();
    campaign.filters.insee.blackList.forEach((insee) => {
      console.log({ insee });
      blackListFormArray.push(
        this._formBuilder.group({
          start: [insee.start],
          end: [insee.end],
        }),
      );
    });

    const whiteListFormArray = <FormArray>filtersForm.get('insee').get('whiteList');
    whiteListFormArray.clear();
    campaign.filters.insee.whiteList.forEach((insee) => {
      whiteListFormArray.push(
        this._formBuilder.group({
          start: [insee.start],
          end: [insee.end],
        }),
      );
    });

    // patch restriction
    const restrictionFormArray = <FormArray>this.campaignFormGroup.get('restrictions');
    restrictionFormArray.clear();
    campaign.restrictions.forEach((restriction) => {
      restrictionFormArray.push(this._formBuilder.group(restriction));
    });

    // patch retribution
    const retributionFormArray = <FormArray>this.campaignFormGroup.get('retributions');
    retributionFormArray.clear();
    if (campaign.retributions.length === 0) {
      // initialize retribution
      retributionFormArray.push(
        this._formBuilder.group({
          for_passenger: this._formBuilder.group({
            free: false,
            per_km: false,
            amount: null,
          }),
          for_driver: this._formBuilder.group({
            per_km: false,
            per_passenger: false,
            amount: null,
          }),
          min: null,
          max: null,
        }),
      );
    } else {
      campaign.retributions.forEach((retribution) => {
        retributionFormArray.push(
          this._formBuilder.group({
            for_passenger: this._formBuilder.group(retribution.for_passenger),
            for_driver: this._formBuilder.group(retribution.for_driver),
            min: retribution.min,
            max: retribution.max,
          }),
        );
      });
    }

    // set defaults
    const distanceRange = filtersForm.get('distance_range');
    if (
      !distanceRange.value ||
      distanceRange.value.length < 2 ||
      (distanceRange.value[0] === 0 && distanceRange.value[1] === 0)
    ) {
      distanceRange.setValue(this._defaultRange);
    }

    // manage stepper when all data is loaded
    this.matStepperCompleted = true;
    if (isTemplate) {
      this.loading = false;
      setTimeout(() => {
        this._matStepper.next();
      }, 0);
    } else if (this.section) {
      this.currentStep = this.section;
      this.loading = false;
    } else {
      this.setLastAvailableStep();
    }
  }

  private loadCampaign(campaignId: number, isDuplicate = false) {
    if (!this._campaignService.campaignsLoaded) {
      this._campaignService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe();
    }
    this._campaignService.entities$.pipe(takeUntil(this.destroy$)).subscribe((campaigns: Campaign[]) => {
      if (campaigns.length === 0) {
        return;
      }
      const foundCampaign = campaigns.filter((campaign) => Number(campaign._id) === campaignId)[0];
      if (foundCampaign) {
        const campaignUx = this._campaignFormatService.toCampaignUxFormat(foundCampaign);
        this.setCampaignToForm(campaignUx, isDuplicate);
      } else {
        this._toastr.error("Les données de la campagne n'ont pas pu être chargées");
        this._router.navigate(['/campaign']);
      }
    });
  }

  private setLastAvailableStep(): void {
    setTimeout(() => {
      // tslint:disable-next-line:prefer-conditional-expression
      if (this.canGoToLastStep) {
        this.currentStep = 3;
      } else if (this.canGoToThirdStep) {
        this.currentStep = 2;
      } else {
        this.currentStep = 1;
      }
      this.loading = false;
    }, 0);
  }
}
