document.addEventListener('DOMContentLoaded', () => {
    const contenedorAcciones = document.getElementById('acciones-usuario');
    const usuarioGuardado = localStorage.getItem('usuarioLogueado');

    // Si no hay sesión activa, dejamos los botones por defecto (Iniciar sesión / Registrarse)
    if (!usuarioGuardado || !contenedorAcciones) {
        return;
    }

    const usuario = JSON.parse(usuarioGuardado);
    const iniciales = `${usuario.nombre?.charAt(0) || ''}${usuario.apellido?.charAt(0) || ''}`.toUpperCase();
    const nombreMostrar = usuario.nombre || 'Usuario';

    // Inyectar estilos limpios para el menú desplegable de usuario
    const estilosMenu = document.createElement('style');
    estilosMenu.textContent = `
    .perfil-dropdown {
      position: relative;
      display: inline-block;
    }
    .perfil-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      border: 1px solid #E2E8F0;
      padding: 6px 14px 6px 8px;
      border-radius: 999px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: #1E293B;
      transition: background 0.2s, border-color 0.2s;
    }
    .perfil-trigger:hover {
      background: #F8FAFC;
      border-color: #CBD5E1;
    }
    .avatar-circulo {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #1C5D99;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 13px;
    }
    .perfil-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
      min-width: 190px;
      padding: 6px;
      z-index: 1000;
      display: none;
      flex-direction: column;
      gap: 2px;
    }
    .perfil-menu.abierto {
      display: flex;
    }
    .perfil-menu a,
    .perfil-menu button {
      text-align: left;
      padding: 10px 12px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #334155;
      transition: background 0.15s;
    }
    .perfil-menu a:hover {
      background: #F1F5F9;
      color: #1C5D99;
    }
    .perfil-menu button.btn-cerrar-sesion {
      color: #DC2626;
    }
    .perfil-menu button.btn-cerrar-sesion:hover {
      background: #FEF2F2;
    }
  `;
    document.head.appendChild(estilosMenu);

    // Reemplazar los botones por el botón de perfil con menú desplegable
    contenedorAcciones.innerHTML = `
    <div class="perfil-dropdown">
      <button type="button" class="perfil-trigger" id="btn-perfil-menu" aria-expanded="false">
        <span class="avatar-circulo">${iniciales}</span>
        <span>${nombreMostrar}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div class="perfil-menu" id="menu-desplegable-usuario">
        <a href="editar-perfil.html">Mi perfil</a>
        <button type="button" class="btn-cerrar-sesion" id="btn-cerrar-sesion">Cerrar sesión</button>
      </div>
    </div>
  `;

    // Lógica para abrir y cerrar el menú al hacer clic
    const btnTrigger = document.getElementById('btn-perfil-menu');
    const menuDesplegable = document.getElementById('menu-desplegable-usuario');

    btnTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaAbierto = menuDesplegable.classList.toggle('abierto');
        btnTrigger.setAttribute('aria-expanded', estaAbierto);
    });

    // Cerrar el menú si el usuario hace clic fuera de él
    document.addEventListener('click', (e) => {
        if (!contenedorAcciones.contains(e.target)) {
            menuDesplegable.classList.remove('abierto');
            btnTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    // Lógica para cerrar sesión con ventana de confirmación personalizada
    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        // Cerramos primero el menú desplegable
        menuDesplegable.classList.remove('abierto');
        btnTrigger.setAttribute('aria-expanded', 'false');

        // Creamos el fondo oscuro y el cuadro de diálogo
        const overlay = document.createElement('div');
        overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 16px;
    `;

        overlay.innerHTML = `
      <div style="
        background: #FFFFFF;
        border-radius: 16px;
        padding: 24px;
        max-width: 380px;
        width: 100%;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        font-family: 'Inter', sans-serif;
        text-align: center;
      ">
        <h3 style="
          margin: 0 0 8px 0;
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          color: #1E293B;
        ">¿Cerrar sesión?</h3>
        <p style="
          margin: 0 0 24px 0;
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
        ">¿Estás seguro de que deseas cerrar sesión?</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button type="button" id="confirmar-no" style="
            flex: 1;
            padding: 10px 16px;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            background: #FFFFFF;
            color: #334155;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
          ">No</button>
          <button type="button" id="confirmar-si" style="
            flex: 1;
            padding: 10px 16px;
            border-radius: 8px;
            border: none;
            background: #DC2626;
            color: #FFFFFF;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
          ">Sí</button>
        </div>
      </div>
    `;

        document.body.appendChild(overlay);

        // Acción si elige "No" (cierra el modal y mantiene la sesión)
        document.getElementById('confirmar-no').addEventListener('click', () => {
            overlay.remove();
        });

        // Acción si elige "Sí" (cierra sesión, quita el modal y restaura botones)
        document.getElementById('confirmar-si').addEventListener('click', () => {
            localStorage.removeItem('usuarioLogueado');
            overlay.remove();
            contenedorAcciones.innerHTML = `
        <a href="login.html" class="boton boton-borde">Iniciar sesión</a>
        <a href="registro.html" class="boton boton-primario">Registrarse</a>
      `;
        });
    });
});

