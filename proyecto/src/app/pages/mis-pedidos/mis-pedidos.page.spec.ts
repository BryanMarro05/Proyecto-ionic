import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisPedidosPage } from './mis-pedidos.page';

describe('MisPedidosPage', () => {
  let component: MisPedidosPage;
  let fixture: ComponentFixture<MisPedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
