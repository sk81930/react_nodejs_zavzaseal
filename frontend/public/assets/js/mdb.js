(() => {
  let sidenav = document.getElementById("main-sidenav");
  if (sidenav) {
    const sidenavInstance = mdb.Sidenav.getInstance(sidenav);

    let innerWidth = null;
    const setMode = (e) => {
      if (window.innerWidth === innerWidth) {
        return;
      }
      innerWidth = window.innerWidth;

      if (window.innerWidth < 1400) {
        sidenavInstance.changeMode("over");
        sidenavInstance.hide();
      } else {
        sidenavInstance.changeMode("side");
        sidenavInstance.show();
      }
    };

    document.querySelectorAll('#main-sidenav .nav-link').forEach(link => {
      link.addEventListener('click', function (e) {
        // Check if the 'href' attribute exists
        if (this.getAttribute('href') && this.getAttribute('href') != "#") {
          if (window.innerWidth < 1400) {
            sidenavInstance.changeMode("over");
            sidenavInstance.hide();
          }  
        }
      });
    });

    setMode();
    window.addEventListener("resize", setMode);

    const optionsUsersSessions = {
      options: {
        scales: {
          y: {
            display: true,
            position: 'left',
          },
          y1: {
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              beginAtZero: true,
            },
          },
        },
      },
    };
  }
})();
