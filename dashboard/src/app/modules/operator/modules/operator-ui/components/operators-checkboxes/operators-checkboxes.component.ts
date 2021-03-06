import { of, Subject } from 'rxjs';
import { takeUntil, filter, debounceTime, switchMap, map } from 'rxjs/operators';

import { Component, forwardRef, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

type OperatorId = number;

interface ListOperatorItem {
  _id: OperatorId;
  name: string;
}

interface ResultInterface {
  list: OperatorId[];
  count: number;
}

@Component({
  selector: 'app-operators-checkboxes',
  templateUrl: './operators-checkboxes.component.html',
  styleUrls: ['./operators-checkboxes.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OperatorsCheckboxesComponent),
      multi: true,
    },
  ],
})
export class OperatorsCheckboxesComponent extends DestroyObservable implements OnInit, ControlValueAccessor {
  public form: FormGroup;
  public operators: Array<ListOperatorItem> = [];
  public result = new Subject<ResultInterface>();
  public loading = true;

  private disabled = false;

  get checkboxes(): any {
    return this.form.controls.boxes as FormArray;
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private territoryApiService: TerritoryApiService,
    private commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit(): void {
    // init the form
    this.form = this.formBuilder.group({ boxes: new FormArray([]), operator_count: 0 });

    // bind checkboxes change
    this.form.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(100)).subscribe(({ boxes }) => {
      // map operators and boxes arrays
      // to get an array of operator _id
      let i = 0;
      const res = new Array(boxes.length);
      for (i = 0; i < boxes.length; i++) {
        if (boxes[i] && this.operators[i]) {
          res.push(this.operators[i]._id);
        }
      }

      this.writeValue({
        list: res.filter((i) => !!i),
        count: boxes.length,
      });
    });

    /**
     * - Load the current territory_id (null if reg or operator) and fetch its allowed operators list.
     * - Load whole ops list and filter with list of allowed ops
     * - keep { _id, name } for display purpose
     */
    this.loading = true;
    this.authService.user$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((user) => {
          return user && user.territory_id
            ? this.territoryApiService.getOperatorVisibility(user.territory_id)
            : of(null);
        }),
        switchMap((allowedOperators) =>
          this.commonDataService.operators$.pipe(
            takeUntil(this.destroy$),
            filter((list) => list && list.length > 0),
            map((list) =>
              (allowedOperators
                ? list.filter((item) => allowedOperators.indexOf(item._id) > -1)
                : list
              ).map(({ _id, name }) => ({ _id, name })),
            ),
          ),
        ),
      )
      .subscribe((operators) => {
        this.operators = operators;
        this.operators.forEach(() => this.checkboxes.push(new FormControl(false)));
        this.form.get('operator_count').setValue(this.operators.length);
        this.loading = false;
      });
  }

  // select all checkboxes
  public setAll(value: boolean): void {
    this.checkboxes.controls.forEach((chk: FormControl) => chk.setValue(value));
  }

  private onTouch = () => {};

  writeValue(res: ResultInterface): void {
    if (this.disabled) return;
    this.result.next(res);
    this.onTouch();
  }

  registerOnChange(fn: any): void {
    this.result.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
