window.addEventListener("load", async () => {
  const jData = await propose();
  if (jData.constant) {
    await constantData(jData.constant)
  };
  if (jData.unique) {
    await uniqueData(jData.unique)
  };
  if (jData.common) {
    let pathname = window.location.pathname
    pathname = pathname.substring(0, pathname.lastIndexOf('/'));
    localStorage.removeItem(pathname + "html");
    await commonData(jData.common)
  };
  if (jData.css.constant) {
    await cssConstant(jData.css);
  };
  if (jData.css.common) {
    let pathname = window.location.pathname
    pathname = pathname.substring(0, pathname.lastIndexOf('/'));
    localStorage.removeItem(pathname + "css");
    await cssCommon(jData.css);
  };
  if (jData.script.constant) {
    await scriptConstant(jData.script)
  };
  if (jData.script.common) {
    await scriptCommon(jData.script)
  };
  window.addEventListener("popstate", async () => {
    if (jData.unique) {
      await uniqueData(jData.unique)
    };
    if (jData.common) {
      await commonData(jData.common)
    };
    if (jData.css.common) {
      await cssCommon(jData.css);
    }
    if (jData.script.constant) {
      await scriptConstant(jData.script)
    }
    if (jData.script.common) {
      await scriptCommon(jData.script)
    }
  })
  const CDALink = document.querySelectorAll("[cda] a")
  CDALink.forEach(cda => {
    cda.addEventListener("click", async (e) => {
      e.preventDefault();
      if (jData.unique) {
        uniqueData(jData.unique, cda);
      }
      if (jData.css) {
        if (jData.common) {
          await commonData(jData.common)
        }
        if (jData.css.common) {
          await cssCommon(jData.css);
        }
      };
      if (jData.script) {
        await scriptConstant(jData.script)
      }
      if (jData.script.common) {
        await scriptCommon(jData.script)
      }
    })
  })
  async function scriptCommon(data) {
    const pathname = window.location.pathname
    const directory = pathname.substring(0, pathname.lastIndexOf('/'));
    for (let dir in data.common) {
      if (directory.endsWith(dir)) {
        for (let scriptPath of data.common[dir]) {
          import(scriptPath)
            .then(async module => {
              const func = module.default
              await func();
            })
        }
      }
    }
  }
  async function scriptConstant(data) {
    for (let scriptPath of data.constant) {
      import(scriptPath)
        .then(async module => {
          const func = module.default
          func();
        })
    }
  }
  async function constantData(data) {
    for (let constKey in data) {
      await getSetData(data[constKey].from, data[constKey].to);
    }
  }
  async function uniqueData(data, cda) {
    if (cda) {
      let url = cda.href;
      history.pushState({}, "", url);
      let pathname = window.location.pathname;
      let defaultPages = jData.default
      if (defaultPages) {
        if (pathname === "/index.html" || pathname === "/" || pathname === "") {
            let defaultPage = defaultPages["/index.html"];
            for (let to in defaultPage) {
              let from = defaultPage[to]
              await getSetData(from, to);
            }
        } else if (pathname === "/404.html" || pathname === "/500.html" || pathname.startsWith("/error")) {
            let defaultPage = defaultPages["/404.html"];
            for (let to in defaultPage) {
              let from = defaultPage[to]
              await getSetData(from, to);
            }
        } else {
          for (let uniqueKey in data) {
            let from = pathname.replace(data[uniqueKey].directory, uniqueKey);
            let to = data[uniqueKey].to;
            await getSetData(from, to);
          }
        }

      } else {
        for (let uniqueKey in data) {
          let from = url.replace(data[uniqueKey].directory, uniqueKey);
          let to = data[uniqueKey].to;
          await getSetData(from, to);
        }
      }
    } else if (!cda) {
      let pathname = window.location.pathname;
      let defaultPages = jData.default
      if (defaultPages) {
        if (pathname === "/index.html" || pathname === "/" || pathname === "") {
            let defaultPage = defaultPages["/index.html"];
            for (let to in defaultPage) {
              let from = defaultPage[to];
              await getSetData(from, to);
            }
        } else if (pathname === "/404.html" || pathname === "/500.html" || pathname.startsWith("/error")) {
            let defaultPage = defaultPages["/404.html"];
            for (let to in defaultPage) {
              let from = defaultPage[to]
              await getSetData(from, to);
            }
        } else {
          for (let uniqueKey in data) {
            let from = pathname.replace(data[uniqueKey].directory, uniqueKey);
            let to = data[uniqueKey].to;
            await getSetData(from, to);
          }
        }
      } else {
        for (let uniqueKey in data) {
          let from = pathname.replace(data[uniqueKey].directory, uniqueKey);
          let to = data[uniqueKey].to;
          await getSetData(from, to);
        }
      }
    }
  }
  async function commonData(data) {
    let pathname = window.location.pathname
    pathname = pathname.substring(0, pathname.lastIndexOf('/'));
    let previusDirectory = localStorage.getItem(pathname + "html");
    if (!previusDirectory) {
      localStorage.setItem(pathname + "html", pathname)
      for (let commonDirectoryKey in data) {
        if (pathname.endsWith(commonDirectoryKey)) {
          let directoryPaths = data[commonDirectoryKey]
          for (let to in directoryPaths) {
            let commonFolderPath = directoryPaths[to];
            await getSetData(commonFolderPath, to);
          }
        }
      }
    }

  }
  async function cssConstant(data) {
    for (let href of data.constant) {
      let find = document.querySelector(`[href='${href}']`);
      if (!find) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = href;
        document.head.appendChild(link);
      }
    }
  }


  async function cssCommon(data) {
    let pathname = window.location.pathname
    pathname = pathname.substring(0, pathname.lastIndexOf('/'));
    const previusDirectory = localStorage.getItem(pathname + "css");
    if (!previusDirectory) {
      localStorage.setItem(pathname + "css", pathname);
      for (let dir in data.common) {
        if (pathname.endsWith(dir)) {
          for (let href of data.common[dir]) {
            let find = document.querySelector(`[href='${href}']`);
            if (!find) {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = 'text/css';
              link.href = href;
              document.head.appendChild(link);
            }
          }
        }
      }
    }

  }
  async function propose() {
    try {
      const response = await fetch('./propose.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  async function getSetData(from, to) {
    try {
      const response = await fetch(from);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.text();
      document.querySelector(to).innerHTML = data;
    } catch (error) {
      console.error('Error fetching data:', to, error);
      document.querySelector(to).innerHTML = 'An error occurred while fetching data.';
    }
  }
});