
export default function initLayout() {

  let isResizingSidebar = false
  let isNavBarCollapsed = false

  let sidebarWidth = 300
  let sidebarMinWidth = 150
  let sidebarMaxWidth = 400

  const breakpoint = 1100
  const navbarCollapsedWidth = 80
  const navbarExpandedWidth = 250

  const sidebarHandle = document.querySelector('#sidebarHandle')
  const navigation = document.querySelector('#navigation')
  const layout = document.querySelector('#page')
  let pageWidth = window.innerWidth
  const navigationSections = document.querySelectorAll('.navigation-section')

  if (pageWidth < breakpoint) collapseNavigation()

  const mouseDownEvent = sidebarHandle.addEventListener('mousedown', (e) => isResizingSidebar = true)
  document.addEventListener('mouseup', (e) => {
    isResizingSidebar = false
    sidebarHandle.removeEventListener('mousedown', mouseDownEvent)
  })
  document.addEventListener('mousemove', (e) => {
    if (isResizingSidebar) {
      sidebarWidth = Math.min(Math.max(parseInt(pageWidth - e.clientX), sidebarMinWidth), sidebarMaxWidth)
      setSidebarWidth(sidebarWidth)
    }
  })

  function setSidebarWidth(pWidth) {
    if ((pWidth > sidebarMinWidth) && pWidth < sidebarMaxWidth) {
      if (!isNavBarCollapsed) {
        layout.style.gridTemplateColumns = `${navbarExpandedWidth}px auto ${pWidth}px`
      }
      else if (isNavBarCollapsed) {
        layout.style.gridTemplateColumns = `${navbarCollapsedWidth}px auto ${pWidth}px`
      }
    }
  }

  window.addEventListener('resize', (e) => {
    pageWidth = e.target.innerWidth
    if (pageWidth < breakpoint && !isNavBarCollapsed) {
      layout.style.gridTemplateColumns = `${navbarCollapsedWidth}px auto ${sidebarWidth}px`
      isNavBarCollapsed = !isNavBarCollapsed
      collapseNavigation()
    }
    else if (pageWidth > breakpoint && isNavBarCollapsed) {
      layout.style.gridTemplateColumns = `${navbarExpandedWidth}px auto ${sidebarWidth}px`
      isNavBarCollapsed = !isNavBarCollapsed
      expandNavigation()
    }
  })

  navigation.addEventListener('mouseenter', e => {
    if (pageWidth < breakpoint && isNavBarCollapsed) {

    expandNavigation()
    }
  })
  navigation.addEventListener('mouseleave', e => {
    if (pageWidth < breakpoint && !isNavBarCollapsed) {

    collapseNavigation()
    }
  })

  function collapseNavigation() {
    navigationSections.forEach(section => section.classList.add("collapsed"))
    layout.style.gridTemplateColumns = `${navbarCollapsedWidth}px auto ${sidebarWidth}px`
    isNavBarCollapsed = true
  }
  function expandNavigation() {
    navigationSections.forEach(section => section.classList.remove("collapsed"))
    layout.style.gridTemplateColumns = `${navbarExpandedWidth}px auto ${sidebarWidth}px`
    isNavBarCollapsed = false
  }


}
