import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { DatosMaestro } from '../../interfaces/usuarios-interfaces';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MaestrosService } from '../../services/maestros-service';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { EliminarUserModal } from '../../modals/eliminar-users-modal/eliminar-user-modal';

@Component({
  selector: 'app-maestros-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './maestros-screen.html',
  styleUrl: './maestros-screen.scss',
})
export class MaestrosScreen implements OnInit{

  public name_user: string = '';
  public rol: string = '';
  public lista_maestros: any[] = [];
  public searchFilter: string = '';

  //Declaramos las columnas que se mostrarán en la tabla
  public displayedColumns: string[] = [
    'id_trabajador',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'rfc',
    'cubiculo',
    'area_investigacion',
    'editar',
    'eliminar'
  ];

  dataSource = new MatTableDataSource<DatosMaestro>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthServices,
    private maestrosService: MaestrosService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer
  ) { }

  ngOnInit(): void {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerMaestros();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.configureDataSourceProperties();
  }

  /**
   * Configura el predicado de filtro y el accessor de ordenamiento para la tabla
   */
  private configureDataSourceProperties(): void {
    // Configurar filtro personalizado
    this.dataSource.filterPredicate = (data: DatosMaestro, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.id_trabajador.toString().toLowerCase().includes(searchStr) ||
        data.first_name.toLowerCase().includes(searchStr) ||
        data.last_name.toLowerCase().includes(searchStr) ||
        `${data.first_name} ${data.last_name}`.toLowerCase().includes(searchStr) ||
        data.email.toLowerCase().includes(searchStr)
      );
    };

    // Configurar accessor de ordenamiento personalizado
    this.dataSource.sortingDataAccessor = (data: DatosMaestro, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'nombre':
          return `${data.first_name} ${data.last_name}`.toLowerCase();
        case 'id_trabajador':
          return data.id_trabajador;
        default:
          return (data as any)[sortHeaderId];
      }
    };
  }

  /**
   * Actualiza el filtro en la tabla
   */
  public applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchFilter = filterValue;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Anunciador de cambios de ordenamiento para accesibilidad
   */
  public announceSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Ordenado ${sortState.direction === 'asc' ? 'ascendente' : 'descendente'}`);
    } else {
      this._liveAnnouncer.announce('Ordenamiento eliminado');
    }
  }

  //Función para obtener la lista de maestros registrados
  public obtenerMaestros(): void {
    this.maestrosService.obtenerListaMaestros().subscribe({
      next: (response) => {
        this.lista_maestros = response;

        if (this.lista_maestros.length > 0) {
          this.lista_maestros.forEach((usuario) => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
        }

        this.dataSource = new MatTableDataSource<DatosMaestro>(
          this.lista_maestros as DatosMaestro[]
        );

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        if (this.sort) {
          this.dataSource.sort = this.sort;
        }

        this.configureDataSourceProperties();
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de maestros');
      }
    });
  }

  public goEditar(id: number) {
    this.router.navigate(['/registro-usuarios', 'maestro', id]);
  }
  //Metodo para eliminar un maestro, se muestra una confirmación antes de eliminar
  public delete(idUser: number) {
    // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar al maestro
    const idUserSession = Number(this.authService.getUserId());
    // --------- Pero el parámetro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
    // Administrador puede eliminar cualquier maestro
    // Maestro solo puede eliminar su propio registro
    if (this.rol === 'administrador' || (this.rol === 'maestro' && idUserSession === idUser)) {
      //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
      const dialogRef = this.dialog.open(EliminarUserModal,{
        data: { id: idUser, rol: 'maestro' }, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      //Después de cerrar el modal, se actualiza la lista de maestros para reflejar los cambios
      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          this.obtenerMaestros();
        }else{
          this.notificationService.error("Maestro no se ha podido eliminar.");
        }
      });
    }else{
      //Si no cumple la condición, se muestra un mensaje de error
      this.notificationService.error("No tienes permiso para eliminar a este maestro.");
    }

  }

}