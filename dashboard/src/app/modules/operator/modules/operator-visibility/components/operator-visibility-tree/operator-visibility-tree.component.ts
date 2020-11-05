import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap, map } from 'rxjs/operators';
import { merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryTree } from '~/core/entities/territory/territory';
import { OperatorVisilibityService } from '~/modules/operator/services/operator-visilibity.service';

interface TerritoryVisibilityTree extends TerritoryTree {
  control?: FormControl;
  selected: boolean;
}
@Component({
  selector: 'app-operator-visibility-tree',
  templateUrl: './operator-visibility-tree.component.html',
  styleUrls: ['./operator-visibility-tree.component.scss'],
})
export class OperatorVisibilityTreeComponent extends DestroyObservable implements OnInit, AfterViewInit {
  searchFilter: FormGroup;
  checkAllValue = false;

  territories: TerritoryVisibilityTree[] = [];
  territoryIdsToShow: number[] = [];
  selectedTerritoryIds: number[] = [];

  visibilityFormControl: FormControl;
  searchMode: boolean;

  constructor(
    private _commonDataService: CommonDataService,
    private _operatorVisilibityService: OperatorVisilibityService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) {
    super();
  }

  swapCheck(ter: TerritoryVisibilityTree) {
    const selectedTerritoryIds = this.selectedTerritoryIds;

    const selected = !ter.selected;

    this.territories.filter((fter) => fter._id === ter._id).forEach((ter) => (ter.selected = selected));

    if (selected) {
      selectedTerritoryIds.push(ter._id);
    } else {
      selectedTerritoryIds.splice(selectedTerritoryIds.indexOf(ter._id), 1);
    }

    this.visibilityFormControl.setValue(selectedTerritoryIds);
  }

  ngOnInit(): void {
    this.initSearchForm();
    this.initVisibilityForm();
  }

  flatTree(tree: Partial<TerritoryTree>[], indent = 0): TerritoryVisibilityTree[] {
    const res = [];
    if (tree)
      for (const ter of tree) {
        ter.indent = indent;
        res.push(ter);
        if (ter.children) {
          const children = this.flatTree(ter.children, indent + 1);
          for (const child of children) res.push({ ...child });
        }
      }

    return res;
  }

  ngAfterViewInit() {
    merge(
      this._commonDataService.territoriesTree$.pipe(
        filter((territories) => !!territories),
        tap((territories) => {
          this.territories = this.flatTree(territories);
        }),
      ),
      this.searchFilter.valueChanges.pipe(debounceTime(100)),
      this._operatorVisilibityService.operatorVisibility$.pipe(
        filter((territories) => !!territories),
        tap((territoryIds) => (this.selectedTerritoryIds = territoryIds)),
      ),
    )
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        map(() => {
          if (this.searchFilter && this.searchFilter.controls.query.value) {
            this.searchMode = true;
            const lowerCasedQuery = this.searchFilter.controls.query.value.toLowerCase();
            const filteredTerritories = this.territories.filter(
              (t) => t.control && `${t.name}`.toLowerCase().includes(lowerCasedQuery),
            );
            return filteredTerritories;
          } else {
            this.searchMode = false;

            return this.territories;
          }
        }),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((filteredTerritories) => {
        this.territoryIdsToShow = filteredTerritories.map((territory) => territory._id);
        this.updateVisibilityForm();
      });

    this.loadVisibility();
  }

  get hasFilter(): boolean {
    return this.searchFilter.value;
  }

  get isLoaded(): boolean {
    return this._operatorVisilibityService.isLoaded;
  }

  public updateCheckAllCheckbox(): void {
    this.checkAllValue =
      this.territories.filter((ter) => ter.activable === true).length === this.selectedTerritoryIds.length;
  }

  public save(): void {
    this._operatorVisilibityService.update(this.selectedTerritoryIds).subscribe(
      () => {
        this._toastr.success('Modifications prises en compte.');
      },
      () => {
        this._toastr.error('Une erreur est survenue');
      },
    );
  }

  public checkAll($event: any): void {
    if ($event.checked) {
      this.territories.forEach((ter) => (ter.selected = true));
      this.selectedTerritoryIds = this.territories.map((ter) => ter._id);
    } else {
      this.territories.forEach((ter) => (ter.selected = false));
      this.selectedTerritoryIds = [];
    }
    this.visibilityFormControl.setValue(this.selectedTerritoryIds);
  }

  public showTerritory(id: number): boolean {
    return this.territoryIdsToShow.indexOf(id) !== -1;
  }

  public get countCheckedTerritories(): number {
    return this.selectedTerritoryIds.length;
  }

  private initVisibilityForm(): void {
    this.visibilityFormControl = this._fb.control([]);
  }

  private updateVisibilityForm(): void {
    if (!this.territories || !this.selectedTerritoryIds) return;

    const territoryIds = this.selectedTerritoryIds;

    this.territories.forEach((ter) => (ter.selected = ter.activable && territoryIds.indexOf(ter._id) !== -1));

    this.visibilityFormControl.setValue(territoryIds);
  }

  private initSearchForm(): void {
    this.searchFilter = this._fb.group({
      query: [''],
    });
  }

  private loadVisibility(): void {
    this._operatorVisilibityService.loadOne().subscribe();
  }
}
