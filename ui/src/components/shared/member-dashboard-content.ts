// lit element
import {
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";

// vaadin
import { Router } from "@vaadin/router";

// membership
import { TabIndex } from "../../enums";
import { AuthService } from "../../service";
import { memberDashboardContentStyles } from "./styles";
import { isAdmin } from "./../../function";

@customElement("member-dashboard-content")
export class MemberDashboardContent extends LitElement {
  @property({ type: String })
  email: string;

  authService: AuthService = new AuthService();

  static get styles(): CSSResult[] {
    return [memberDashboardContentStyles];
  }
  goToHome(): void {
    Router.go("/home");
  }

  goToUser(): void {
    Router.go("/user");
  }

  goToReports(): void {
    Router.go("/reports");
  }

  goToMembers(): void {
    Router.go("/members");
  }

  goToResources(): void {
    Router.go("/resources");
  }

  getTabIndex(pathName: string): number {
    switch (pathName) {
      case "/home":
        return TabIndex.home;
      case "/user":
        return TabIndex.user;
      case "/reports":
        return TabIndex.reports;
      case "/members":
        return TabIndex.members;
      case "/resources":
        return TabIndex.resources;
      default:
        return -1;
    }
  }

  handleLogout(): void {
    this.authService.logout().subscribe({
      next: (response: null) => {
        localStorage.removeItem("jwt");
        window.location.href = "/home";
      },
    });
  }

  displayLogout(): TemplateResult {
    return html`
      <mwc-button
        class="logout"
        slot="actionItems"
        label="Log out"
        icon="logout"
        @click=${this.handleLogout}
      ></mwc-button>
    `;
  }

  renderAdminTabs(): TemplateResult | void {
    if (isAdmin()) {
      return html`
        <mwc-tab
          label="Reports"
          icon="show_chart"
          @click=${this.goToReports}
        ></mwc-tab>
        <mwc-tab
          label="Members"
          icon="people"
          @click=${this.goToMembers}
        ></mwc-tab>
        <mwc-tab
          label="Resources"
          icon="devices"
          @click=${this.goToResources}
        ></mwc-tab>
      `;
    }

    return html``;
  }

  render(): TemplateResult {
    return html`
      <mwc-top-app-bar-fixed centerTitle>
        <div slot="title">Member Dashboard</div>
        <div slot="actionItems">${this.email}</div>
        ${this.displayLogout()}
      </mwc-top-app-bar-fixed>
      <mwc-tab-bar activeIndex=${this.getTabIndex(window.location.pathname)}>
        <mwc-tab label="Home" icon="home" @click=${this.goToHome}></mwc-tab>
        <mwc-tab
          label="User"
          icon="account_circle"
          @click=${this.goToUser}
        ></mwc-tab>
        ${this.renderAdminTabs()}
      </mwc-tab-bar>

      <slot> </slot>
    `;
  }
}
