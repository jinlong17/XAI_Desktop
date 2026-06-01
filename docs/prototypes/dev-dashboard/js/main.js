renderPrimaryNav();

document.querySelectorAll("[data-page-jump]").forEach(button => {
  button.addEventListener("click", () => setPage(button.dataset.pageJump));
});

document.getElementById("moduleDrawerClose").addEventListener("click", closeModuleDrawer);
document.getElementById("moduleDrawerOverlay").addEventListener("click", closeModuleDrawer);
document.getElementById("moduleDrawerPrimary").addEventListener("click", () => {
  if(!activeDrawerModule) return;
  openProductTarget(activeDrawerModule.target);
  closeModuleDrawer();
});
document.getElementById("moduleDrawerLocate").addEventListener("click", () => {
  if(!activeDrawerModule) return;
  setPage("product-flow");
  setProduct(activeDrawerModule.item.key);
  closeModuleDrawer();
});
window.addEventListener("keydown", event => {
  if(event.key === "Escape" && document.getElementById("moduleDrawer")?.classList.contains("is-open")){
    closeModuleDrawer();
  }
});

window.addEventListener("hashchange", () => setPage(location.hash.slice(1), false));

function initUsageOpsCopyButtons(){
  document.querySelectorAll("[data-copy-target]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const text = target?.textContent?.trim();
      if(text) copyText(text, button);
    });
  });
}

initThemeSettings();
initUsageOpsCopyButtons();
initUsageOpsControls();
renderOverview();
renderKpis();
renderOverviewFlow();
renderOverviewModules();
renderOverviewDeployment();
renderStructureMap();
renderBranchFlow();
renderModules();
setProduct(products[0]?.key);
renderDeploymentDashboard();
renderSkillAgentCatalog();
initDocLibrary();
renderDevData();
renderTaskProgress();
renderBranches();
initReleaseLinks();
renderOverallReleases();
renderReleaseModules();
renderReleaseRows();
setPage(location.hash.slice(1), false);
