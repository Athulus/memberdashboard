// lit element
import {
  LitElement,
  html,
  TemplateResult,
  customElement,
  CSSResult,
  property,
} from "lit-element";

// material
import { Checkbox } from "@material/mwc-checkbox";

// polymer
import "@polymer/paper-tooltip";

// membership
import { MemberResource, MemberResponse } from "./types";
import { showComponent } from "../../function";
import { ResourceService, MemberService, PaymentService } from "../../service";
import { memberListStyles } from "./styles/member-list-styles";
import { coreStyles } from "./../shared/styles/core-styles";
import "../shared/rfid-modal";
import "./modals/add-member-to-resource-modal";
import "./modals/remove-member-from-resource-modal";
import "./modals/add-members-to-resource-modal";
import { ToastMessage } from "../shared/types";
import { displayMemberStatus } from "./function";

@customElement("member-list")
export class MemberList extends LitElement {
  @property({ type: Array })
  members: MemberResponse[] = [];

  @property({ type: Number })
  memberCount: number = 0;

  memberResources: Array<MemberResource> = [];
  email: string = "";

  memberEmails: string[] = [];
  toastMsg: ToastMessage;

  membersCheckBoxTemplate: NodeListOf<Checkbox>;
  allMembersCheckBoxTemplate: Checkbox;

  memberService: MemberService = new MemberService();
  resourceService: ResourceService = new ResourceService();
  paymentsService: PaymentService = new PaymentService();

  static get styles(): CSSResult[] {
    return [memberListStyles, coreStyles];
  }

  firstUpdated(): void {
    this.allMembersCheckBoxTemplate =
      this.shadowRoot.querySelector("#all-members");
  }

  updated(): void {
    this.membersCheckBoxTemplate =
      this.shadowRoot.querySelectorAll("mwc-checkbox");
  }

  getMembers(): void {
    this.memberService.getMembers().subscribe({
      next: (result: MemberResponse[]) => {
        this.members = result;
        this.memberCount = this.members.length;
      },
      error: () => {
        console.error("unable to get members");
      },
    });
  }

  openAddMemberToResourceModal(email: string): void {
    this.email = email;
    this.requestUpdate();
    showComponent("#add-member-to-resource-modal", this.shadowRoot);
  }

  openAddMembersToResourceModal(): void {
    this.memberEmails = this.memberEmails.map((x: string) => x);
    this.requestUpdate();
    showComponent("#add-members-to-resource-modal", this.shadowRoot);
  }

  openRemoveMemberFromResourceModal(
    email: string,
    memberResources: Array<MemberResource>
  ): void {
    this.email = email;
    this.memberResources = memberResources;
    this.requestUpdate();
    showComponent("#remove-member-from-resource-modal", this.shadowRoot);
  }

  openNewMemberModal(): void {
    showComponent("#new-member-modal", this.shadowRoot);
  }

  openRFIDModal(email: string = ""): void {
    this.email = email;
    this.requestUpdate();

    showComponent("#rfid-modal", this.shadowRoot);
  }

  handleEmail(event: Event, email: string): void {
    this.allMembersCheckBoxTemplate.checked = false;

    const checked: boolean = (
      event.target as EventTarget & {
        checked: boolean;
      }
    ).checked;

    if (checked) {
      this.memberEmails.push(email);
    } else {
      this.memberEmails = this.memberEmails.filter((x: string) => x !== email);
    }
  }

  exportNonMembers(): void {
    this.memberService.downloadNonMembersCSV().subscribe({
      next: (response: Blob) => {
        const link: HTMLAnchorElement = document.createElement("a");
        const url: string = window.URL.createObjectURL(response);
        link.href = url;
        link.setAttribute("download", `nonmembersOnSlack.csv`);
        link.click();

        window.URL.revokeObjectURL(url); // no need to keep it in memory if it has been used.
      },
      error: () => {
        this.displayToastMsg("Hrmmm, unable to export nonmembers");
      },
    });
  }

  getMoreActions(member: MemberResponse): TemplateResult {
    return html`
      <div class="more-actions-container">
        <mwc-menu id=${"more-actions-" + member.id} x="-50" y="-50">
          <mwc-list-item @click=${() =>
            this.openRFIDModal(member.email)}> Assign RFID </mwc-list-item>
          <mwc-list-item @click=${() =>
            this.openAddMemberToResourceModal(member.email)}> 
            <span class="add-resources"> Add resource <span> 
          </mwc-list-item>
          <mwc-list-item @click=${() =>
            this.openRemoveMemberFromResourceModal(
              member.email,
              member.resources
            )}> 
            <span class="remove-resources">Remove resource </span> 
          </mwc-list-item>
        </mwc-menu>
      </div>
    `;
  }

  handleMoreActions(memberId: string): void {
    showComponent("#more-actions-" + memberId, this.shadowRoot);
  }

  handleAllEmails(event: Event): void {
    const checked: boolean = (
      event.target as EventTarget & {
        checked: boolean;
      }
    ).checked;

    if (checked) {
      this.memberEmails = this.members.map((x: MemberResponse) => x.email);
      this.setAllCheckbox(true);
    } else {
      this.memberEmails = [];
      this.setAllCheckbox(false);
    }
  }

  setAllCheckbox(checked: boolean): void {
    this.membersCheckBoxTemplate.forEach((x: Checkbox) => {
      x.checked = checked;
    });
  }

  displayMembersTable(): TemplateResult {
    return html`
      ${this.members?.map((x: MemberResponse) => {
        return html`
          <tr>
            <td>
              <mwc-checkbox
                @change=${(event: Event) => this.handleEmail(event, x.email)}
              ></mwc-checkbox>
              <span>${x.name}</span>
            </td>
            <td>${x.email}</td>
            <td>${displayMemberStatus(x.memberLevel)}</td>
            <td>
              <div class="horizontal-scrollbar">
                ${this.displayMemberResources(x.resources)}
              </div>
            </td>
            <td>${x.rfid !== "notset" ? x.rfid : "Not set"}</td>
            <td>
              <mwc-icon-button
                icon="more_horiz"
                @click=${() => this.handleMoreActions(x.id)}
              ></mwc-icon-button>
              ${this.getMoreActions(x)}
            </td>
          </tr>
        `;
      })}
    `;
  }

  displayMemberResources(resources: Array<MemberResource>): string {
    if (resources?.length > 0) {
      return resources.map((x: MemberResource) => x.name).join(", ");
    }
    return "No resources";
  }

  refreshMemberList(): void {
    this.getMembers();
    this.requestUpdate();
  }

  displayToastMsg(message: string): void {
    this.toastMsg = Object.assign({}, { message: message, duration: 4000 });
    this.requestUpdate();
    showComponent("#toast-msg", this.shadowRoot);
  }

  render(): TemplateResult {
    return html`
      <div class="member-container">
        <div class="member-header">
          <h3>Number of active members: ${this.memberCount}</h3>
          <div>
            <mwc-button
              id="slack-clean-up"
              class="margin-r-24"
              label="Slack Clean Up"
              unelevated
              dense
              @click=${this.exportNonMembers}
            >
            </mwc-button>
            <paper-tooltip for="slack-clean-up" animation-delay="0">
              This will download a csv of email addresses on slack that aren't
              members.
            </paper-tooltip>
            <mwc-button
              class="rfid-button"
              label="Assign rfid"
              unelevated
              dense
              @click=${() => this.openRFIDModal()}
            >
            </mwc-button>
          </div>
        </div>
        <div class="all-members-action-container">
          <mwc-button
            unelevated
            dense
            label="Add resource to members"
            @click=${this.openAddMembersToResourceModal}
          >
          </mwc-button>
          <mwc-formfield label="All members">
            <mwc-checkbox
              id="all-members"
              @change=${this.handleAllEmails}
            ></mwc-checkbox>
          </mwc-formfield>
        </div>
        <table>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Member Status</th>
            <th>Resources</th>
            <th>RFID</th>
            <th>Actions</th>
          </tr>
          ${this.displayMembersTable()}
        </table>
      </div>
      <add-members-to-resource-modal
        id="add-members-to-resource-modal"
        .emails=${this.memberEmails}
        @updated=${this.refreshMemberList}
      >
      </add-members-to-resource-modal>
      <add-member-to-resource-modal
        id="add-member-to-resource-modal"
        .email=${this.email}
        @updated=${this.refreshMemberList}
      >
      </add-member-to-resource-modal>
      <remove-member-from-resource-modal
        id="remove-member-from-resource-modal"
        .email=${this.email}
        .memberResources=${this.memberResources}
        @updated=${this.refreshMemberList}
      >
      </remove-member-from-resource-modal>
      <rfid-modal
        id="rfid-modal"
        .email=${this.email}
        .showNewMemberOption=${true}
        @updated=${this.refreshMemberList}
      >
      </rfid-modal>
      <toast-msg id="toast-msg" .toastMsg=${this.toastMsg}> </toast-msg>
    `;
  }
}
