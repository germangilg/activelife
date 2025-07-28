// ...TU CÓDIGO ANTERIOR DE PROGRESO AQUÍ...

// CALENDARIO MODERNO DE ENTRENAMIENTOS
function pintarCalendarioEntrenamientos() {
    const calendarDays = document.getElementById('calendarDays');
    const calMonthYear = document.getElementById('calMonthYear');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const modalResumenDia = document.getElementById('modalResumenDia');
    const resumenFecha = document.getElementById('resumenFecha');
    const resumenInfo = document.getElementById('resumenInfo');
    const btnCerrarResumen = document.getElementById('btnCerrarResumen');

    if (!calendarDays) return;

    let today = new Date();
    let mes = today.getMonth();
    let anio = today.getFullYear();

    // Permitir navegación de meses
    prevMonth.onclick = () => { mes--; if(mes < 0){ mes=11; anio--; } renderCalendar(); };
    nextMonth.onclick = () => { mes++; if(mes > 11){ mes=0; anio++; } renderCalendar(); };
    if(btnCerrarResumen) btnCerrarResumen.onclick = () => { modalResumenDia.classList.add('hidden'); };

    function renderCalendar() {
        calendarDays.innerHTML = '';
        let actividades = getData('actividades');
        // Marcar días con actividad
        let actividadesPorFecha = {};
        actividades.forEach(a => {
            if (!actividadesPorFecha[a.fecha]) actividadesPorFecha[a.fecha] = [];
            actividadesPorFecha[a.fecha].push(a);
        });

        let primerDiaMes = new Date(anio, mes, 1);
        let primerDiaSemana = (primerDiaMes.getDay() + 6) % 7; // hace que lunes sea 0
        let diasEnMes = new Date(anio, mes + 1, 0).getDate();

        calMonthYear.textContent = primerDiaMes.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^./, str => str.toUpperCase());

        // Dias vacíos inicio
        for (let i = 0; i < primerDiaSemana; i++) {
            const empty = document.createElement('div');
            calendarDays.appendChild(empty);
        }

        // Días del mes
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fecha = new Date(anio, mes, dia);
            const fechaISO = fecha.toISOString().slice(0,10);
            const divDia = document.createElement('div');
            divDia.className =
              "relative flex items-center justify-center aspect-square rounded-xl text-[#101518] font-bold cursor-pointer transition-all duration-200 select-none hover:bg-[#eaeef1]";
            divDia.textContent = dia;
            // Marcar hoy
            if (
              fecha.getDate() === today.getDate() &&
              fecha.getMonth() === today.getMonth() &&
              fecha.getFullYear() === today.getFullYear()
            ) {
                divDia.classList.add("ring-2", "ring-[#1993e5]");
            }
            // Marcar días con entrenamiento
            if (actividadesPorFecha[fechaISO]) {
                divDia.classList.add("bg-[#1993e5]", "text-white", "hover:bg-[#3ea6f6]");
                divDia.title = "Entrenamientos: " + actividadesPorFecha[fechaISO].length;
                divDia.onclick = () => {
                    mostrarResumenDia(fechaISO, actividadesPorFecha[fechaISO]);
                };
                // Circulito indicador
                const punto = document.createElement("span");
                punto.className = "absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFD600] rounded-full";
                divDia.appendChild(punto);
            }
            calendarDays.appendChild(divDia);
        }
    }

    function mostrarResumenDia(fechaISO, actividades) {
        if (!modalResumenDia) return;
        const fechaObj = new Date(fechaISO);
        resumenFecha.textContent = fechaObj.toLocaleDateString('es-ES', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
        let minutos = actividades.reduce((sum, a) => sum + a.duracion, 0);
        let lista = actividades.map(a =>
          `<li class="mb-1"><span class="font-semibold">${a.actividad}</span> - ${a.duracion} min. (esfuerzo ${a.esfuerzo})</li>`
        ).join('');
        resumenInfo.innerHTML =
          `<p class="mb-2"><span class="font-bold text-[#1993e5]">${minutos}</span> minutos en total.</p>
          <ul class="list-disc pl-5">${lista}</ul>`;
        modalResumenDia.classList.remove('hidden');
    }

    renderCalendar();
}
pintarCalendarioEntrenamientos();