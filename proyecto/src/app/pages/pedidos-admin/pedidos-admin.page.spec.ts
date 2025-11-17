import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosAdminPage } from './pedidos-admin.page';

describe('PedidosAdminPage', () => {
  let component: PedidosAdminPage;
  let fixture: ComponentFixture<PedidosAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
