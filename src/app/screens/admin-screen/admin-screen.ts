import { Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { AuthServices } from '../../services/auth-services';
import { Router } from '@angular/router';
import { AdministradoresService } from '../../services/administradores-service';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-admin-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './admin-screen.html',
  styleUrl: './admin-screen.scss',
})
export class AdminScreen implements OnInit{
  // Variables y métodos del componente
  public name_user: string = "";
  public lista_admins: any[] = []; //array de tipo init porque aca vamos a guardar la lista de administradores que obtenemos del backend de tipo json

  constructor(
    private authService: AuthServices,
    private notificationService: NotificationService,
    private administradoresService: AdministradoresService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    this.obtenerAdministradores();
  }

  // Método para cargar la lista de administradores al iniciar el componente
  public obtenerAdministradores(): void {
    this.administradoresService.obtenerAdmins().subscribe({
      next: (response) => {
        this.lista_admins = response;
      },
      error: () => {
        this.notificationService.error('Error al cargar la lista de administradores. Intente de nuevo más tarde.');
      }
    });
  }

  //Metodo para editar un administrador, se redirige a la pantalla de edición con el id del administrador seleccionado
  public goEditar(id: number): void {
    this.router.navigate(['/registro-usuarios', 'administrador', id]);
  }

  //Metodo para eliminar un administrador, se muestra una confirmación antes de eliminar
  public delete(id: number): void {

  }

}