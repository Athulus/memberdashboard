// lit element
import {
  LitElement,
  html,
  TemplateResult,
  customElement,
  css,
  CSSResult,
  property,
} from "lit-element";

// material
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-select";
import "@material/mwc-list/mwc-list-item";
import "@material/mwc-snackbar";
import "@material/mwc-textfield";

// membership
import { MemberLevel, MemberResource, MemberResponse } from "./types";
import "../shared/rfid-modal";
import "./modals/add-member-to-resource-modal";
import "./modals/remove-member-from-resource-modal";
import { showComponent } from "./../../function";
import { ResourceService } from "../../service/resource.service";
import { MemberService } from "../../service/member.service";
import "../shared/card-element";

@customElement("member-list")
export class MemberList extends LitElement {
  @property({ type: Array })
  members: MemberResponse[] = [];

  @property({ type: Number })
  memberCount: number = 0;

  memberResources: Array<MemberResource> = [];
  email: string = "";

  memberService: MemberService = new MemberService();
  resourceService: ResourceService = new ResourceService();

  static get styles(): CSSResult {
    return css`
      h1 {
        margin-top: 0px;
        margin-bottom: 0px;
        justify-self: start;
      }
      .member-container {
        display: grid;
        justify-content: center;
        align-items: center;
        text-align: center;
        margin: 44px;
      }
      .member-header {
        display: inherit;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
      }
      .name {
        text-transform: capitalize;
      }
      td,
      th {
        text-align: left;
        padding: 8px;
        font-size: 20px;
        border: 1px solid #e1e1e1;
        max-width: 320px;
      }
      table {
        margin-top: 24px;
        border-spacing: 0px;
      }
      .member-count {
      }
      .rfid-button {
        justify-self: end;
      }
      .remove {
        --mdc-theme-primary: #e9437a;
      }
      .horizontal-scrollbar {
        overflow: auto;
        max-width: 320px;
        white-space: nowrap;
      }
    `;
  }

  displayMemberStatus(memberLevel: number): string {
    switch (memberLevel) {
      case MemberLevel.inactive:
        return "Inactive";
      case MemberLevel.student:
        return "Student";
      case MemberLevel.classic:
        return "Classic";
      case MemberLevel.standard:
        return "Standard";
      case MemberLevel.premium:
        return "Premium";
      default:
        return "No member status found";
    }
  }

  getMembers(): void {
    this.memberService.getMembers().subscribe({
      next: (result: any) => {
        if ((result as { error: boolean; message: any })?.error) {
          return console.error(
            (result as { error: boolean; message: any }).message
          );
        }
        this.members = result as MemberResponse[];
        this.memberCount = this.members.length;
      },
    });
  }

  openAddMemberToResourceModal(email: string): void {
    this.email = email;
    this.requestUpdate();
    showComponent("#add-member-to-resource-modal", this.shadowRoot);
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

  openRFIDModal(): void {
    showComponent("#rfid-modal", this.shadowRoot);
  }

  displayMembersTable(): TemplateResult {
    return html`
      ${this.members.map((x: MemberResponse) => {
        return html`
          <tr>
            <td class="name">${x.name}</td>
            <td>${x.email}</td>
            <td>${this.displayMemberStatus(x.memberLevel)}</td>
            <td>
              <div class="horizontal-scrollbar">${this.displayMemberResources(
                x.resources
              )}</div>
              <div>
                <mwc-button
                  label="Add resource"
                  @click=${() => this.openAddMemberToResourceModal(x.email)}
                ></mwc-button>
                <mwc-button
                  class="remove"
                  label="Remove resource"
                  @click=${() =>
                    this.openRemoveMemberFromResourceModal(
                      x.email,
                      x.resources
                    )}
                ></mwc-button>
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

  render(): TemplateResult {
    return html`
      <card-element>
        <div class="member-container">
          <div class="member-header">
            <h1>Members</h1>
            <span class="member-count">
              <b>Member count: </b> 
              ${this.memberCount} 
            </span>
            <mwc-button 
              class="rfid-button" 
              label="Assign rfid"
              unelevated 
              dense 
              @click=${this.openRFIDModal}> 
            </mvc-button>
          </div>
          <table>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Member Status</th>
              <th>Resources</th>
            </tr>
            ${this.displayMembersTable()}
          </table>
        </div>
        <add-member-to-resource-modal 
          id="add-member-to-resource-modal"
          .email=${this.email}
          @updated=${this.refreshMemberList}> 
        </add-member-to-resource-modal>
        <remove-member-from-resource-modal
          id="remove-member-from-resource-modal"
          .email=${this.email}
          .memberResources=${this.memberResources}
          @updated=${this.refreshMemberList}> 
        </remove-member-from-resource-modal>
        <rfid-modal
          id="rfid-modal"> 
        </rfid-modal>
      </card-element>
    `;
  }
}
