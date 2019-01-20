import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By } from 'protractor';


describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
    }).compileComponents();
    //   var fixture = TestBed.createComponent(AppComponent);
    //    const comp = fixture.debugElement.componentInstance;
    //   const de=comp.debugElement.query(By.id('map'));
    //   const el=de.nativeElement;

    // });
  }));

  console.log('Runnning');
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'map2'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('map2');
  });

  it('should have map', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const de=app.debugElement.query(By.id('map'));
    expect(de.isPresent().tobe(true));

  });

  it('should have search box', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const de=app.debugElement.query(By.css('.mapboxgl-ctrl-top-left .mapboxgl-ctrl'));
    expect(de.isPresent().tobe(true));

  });









});
