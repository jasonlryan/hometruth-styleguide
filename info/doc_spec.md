HomeTruth is envisioned as an **AI-powered Personal Property Assistant** that revolutionizes property management by offering hyper-personalized insights and proactive guidance. A core component of this vision is a robust document upload system, which acts as the **"digital logbook"** for every property, making its history as tamper-proof as a banknote and easily trustworthy. The system focuses on intuitive UI and rich functionality, prioritizing the homeowner's or potential owner's journey.

Here is a full specification and brief for designing the document upload system, focusing on its UI and functionality:

## Document Upload System: UI and Functionality Specification

### 1. What Documents Will Be Uploaded?

The HomeTruth platform will allow users to upload a comprehensive range of property-related documents, forming a **"HomeTruth Report"** – a tamper-proof digital twin of every property. This acts as a service log similar to a Carfax report for homes.

**Core Document Types:**

- **Legal & Transactional Documents:**
  - Mortgage Deeds / Agreements
  - Title Deeds
  - Agreement of Sale
  - Property Surveys (e.g., Surveyor's Report, Home Inspection Documents)
  - Conveyancing Documents
  - Contracts
  - Legal documents for property ownership, sales, and purchases
  - Planning Permissions
  - Divorce settlement templates
- **Maintenance & Warranty Records:**
  - Plumber's Invoices / Receipts
  - Boiler Warranties
  - Appliance Manuals
  - Tech Service Logs
  - Maintenance records and history of contractor interactions
  - Service schedules
- **Compliance & Financial Records:**
  - Energy Performance Certificates (EPCs)
  - Insurance Policies
  - Utility Bills
  - Budgeting & Expense Tracking Documents
  - Grant eligibility documents
  - HMO licensing checklists
- **Other Property-Related Information:**
  - Property prospectuses
  - Photos of home improvements

**Supported File Formats:**
The system will support common file types for upload, including **PDF, DOC(X), JPG, and PNG**. File size limits will apply, with a free tier offering 5MB/file and a Pro tier allowing 25MB/file.

**Methods of Data Ingestion:**
Documents can enter the logbook through various streamlined methods to minimize user effort:

- **Drag-and-drop** directly into the Document Vault UI.
- **Mobile camera capture** for physical documents and receipts.
- **Email parsing**: Homeowners can simply forward an invoice to a designated inbox, and software automatically reads and files it.
- **Contractor QR code scan**: Contractors can scan a QR code on their phone to add a digital signature, creating a "verifiable credential" that is then anchored on the blockchain.
- **IoT readings**: Harvesting data from smart home devices.
- **Integration with public records**: Pulling in data like EPCs or Land-Registry data automatically.

### 2. What Categories Will Be Used for Documents?

Documents will be intelligently categorized to facilitate organization, searching, and AI analysis. The categories can be system-defined with options for user customization.

**Primary Categories (System Tags):**

- **Financial** (e.g., mortgage documents, utility bills, receipts, investment statements)
- **Legal** (e.g., deeds, contracts, compliance certificates, planning permissions)
- **Maintenance** (e.g., invoices, service records, appliance manuals, warranties)
- **Compliance** (e.g., EPCs, gas safety checks, HMO licenses, local regulations)
- **Surveys & Reports** (e.g., surveyor's reports, home inspection reports)
- **Property Details** (e.g., floor plans, property descriptions, photos)

**User-Defined Categories:**

- Users will have the ability to create **custom tags and folders** for documents, allowing for personalized organization beyond system-generated categories.

### 3. How Will We View These Documents?

The document viewing experience will be designed for clarity, ease of access, and intelligent interaction, adapting to the user's needs and preferences.

**Viewing Modes:**

- **Simple View:** For users with fewer than 10 documents, a clean, uncluttered interface.
- **Advanced View:** For users with more than 10 documents, offering richer organizational tools like folders, tags, filters, and a choice between grid or list layouts.
- **Document Reader with AI Highlights:**
  - When viewing a document, the AI will automatically **highlight key terms, deadlines, and potential risks** within the text.
  - Users can click on highlighted sections for plain-language explanations or further AI insights.
- **Preview Pane:** A quick preview of document content without opening the full file.

**User Interface Elements:**

- **Document Library:** A central hub for all uploaded documents.
- **Search Bar:** Allows quick searching by document name, content, or keywords.
- **Filters:** Apply filters based on categories (system tags or custom tags), date uploaded, document type, or AI-identified urgency.
- **Sorting Options:** Sort by date, name, category, or AI relevance.
- **Responsive Design:** Ensures a consistent and optimized viewing experience across web and mobile platforms.

### 4. How Will We Organize These Documents?

Organization is key to maintaining a "single source of truth" for the home. The system will provide flexible and intelligent organizational tools.

**Core Organizational Features:**

- **Folders:** Users can create custom folders to group related documents (e.g., "New Roof Project," "House Sale 2025").
- **Tags:** Apply multiple tags (system-generated or custom) to documents for cross-referencing and easier retrieval.
- **AI Auto-Tagging:** The AI will automatically suggest and apply relevant tags based on document content (e.g., detecting an invoice for a boiler service and tagging it "Maintenance," "Boiler," "HVAC").
- **Metadata Editing:** Users can edit document titles and add descriptions for better context.

### 5. How Will We Update and Delete Documents?

The system will provide clear functionalities for managing the lifecycle of documents, ensuring users have full control over their uploaded data.

**Update Functionality:**

- **Version Control (Future Phase):** While not in MVP, a future phase could include version control, allowing users to upload updated versions of a document while retaining previous iterations for historical reference.
- **Metadata Update:** Users can easily edit document titles, tags, and descriptions without re-uploading the file.
- **Replace Document:** Option to upload a new file to replace an existing one, useful for updated agreements or reports.

**Delete Functionality:**

- **Individual Deletion:** Pro users can delete individual documents from their Document Vault.
- **Bulk Deletion:** Option to select and delete multiple documents simultaneously.
- **Confirmation Prompt:** A clear confirmation step will be required before permanent deletion to prevent accidental loss.
- **GDPR Compliance:** The system will ensure that deleted data is handled in compliance with GDPR and other data protection regulations, allowing users to access, correct, or delete their data easily. While a cryptographic hash of events might remain on the blockchain for tamper-proofing, the full documents will be deleted from private cloud storage.

### 6. What Actions Can Be Taken on Documents & AI Alerts?

The AI-driven document system is designed to be highly proactive, transforming passive document storage into an active, intelligent assistant.

**AI-Powered Actions on Documents:**

- **Smart Document Interaction:** Users can "ask AI questions about documents" such as _"What's my lease renewal clause?"_ or _"What does this clause mean?"_.
- **Data Extraction & Filing:** Software automatically reads dates, costs, model numbers from invoices and files them.
- **Highlighting Key Information:** AI highlights critical terms, deadlines, and risks directly within viewed documents.
- **Document Comparison:** Compare key clauses, rates, or terms between multiple uploaded documents (e.g., comparing mortgage offers).
- **Fraud Detection:** Machine-learning tools look for anomalies in submitted work records (e.g., a new roof claimed twice in one week) to deter bogus contractors.
- **Generating HomeTruth Report:** Create a compiled, verified report of property history for sharing.

**AI Alerts and Reminders from Documents:**

- **Proactive Reminders:** AI-driven alerts for deadlines, tasks, and obligations. This includes:
  - Maintenance tasks (e.g., "It's time to service your HVAC filter").
  - Warranty expirations.
  - Compliance deadlines (e.g., "Don't forget your insurance renewal next week!", gas safety checks, EPC upgrades).
  - Mortgage offer expiry dates.
- **Risk Alerts:** AI identifies potential risks flagged in documents, like "boundary disputes" in a surveyor's report, and explains their implications.
- **Cost-Saving Recommendations:** AI proactively suggests opportunities identified in documents, like energy upgrades or refinancing opportunities.
- **Market Trend Alerts:** Alerts about market trends affecting property value.

### 7. What Messages and Notes Can Be Autogenerated and Scheduled From Them?

The system will generate dynamic, personalized content, including notes for future reference and scheduled messages, all powered by the AI's understanding of both documents and the user's profile.

**Autogenerated Messages & Notes:**

- **AI Chat Responses as "Notes":** Users can save AI chat responses as "Notes" for future reference. Pro users have unlimited saving and organization features.
- **System "Insights":** AI auto-generates "Insights" directly from uploaded documents, providing actionable summaries or recommendations. These insights can be filtered and deleted.
- **Personalized Checklists:** AI automatically generates customized buying checklists with reminders for legal, financial, and inspection steps based on uploaded documents (e.g., after a mortgage agreement upload, it suggests scheduling a home inspection).
- **Renegotiation Scripts:** AI can generate scripts for negotiation based on document analysis (e.g., "Here's how to ask the seller for a price reduction due to the roof repair").
- **Legal Document Summaries:** Plain-language explanations of complex legal clauses.
- **Compliance Action Plans:** Detailed steps for meeting regulatory requirements based on specific documents.

**Scheduled Messages:**

- **Proactive Reminders:** Automated reminders for maintenance tasks, warranty expirations, and compliance deadlines, scheduled directly from document analysis.
- **Progress-Based Nudges:** Messages guiding users through a dynamic buyer journey map, updating them on their step-by-step progress and next actions (e.g., "You're at Step 3/8. Next: Home inspection (due May 15)").
- **Personalized Tips:** AI proactively surfaces personalized tips based on the user's emotional and attitudinal profile, learning how they respond to market news or maintenance requests.
- **Self-Care Tips:** For emotionally stressed users, AI can suggest self-care messages alongside practical advice.

### 8. Integration with RAG: Talking to Documents

The document upload system is a fundamental part of HomeTruth's **Retrieval-Augmented Generation (RAG)** architecture, enabling intelligent, context-aware conversations and insights derived from the user's specific property data.

**How it Works:**

- **RAG Layer:** A RAG layer augments chat queries with content from both HomeTruth's curated knowledge base and **all user-uploaded documents**.
- **Contextual Querying:** Users can "talk to a doc, a class of docs, or all docs" [query instruction]:
  - **Single Document:** "Explain this clause in my contract." The AI will retrieve and analyze that specific document for the answer.
  - **Class of Documents:** "Summarize all legal risks from my property surveys." The AI will filter for survey documents and extract relevant risk data.
  - **All Documents:** "What are all the upcoming deadlines related to my property?" The AI will scan all uploaded documents (mortgage, warranties, compliance) to compile a comprehensive list.
- **User-Document-Aware Chat:** The AI Assistant's chat interface is document-aware, meaning its responses are directly informed by the content of the user's private document vault.
- **Persistent Memory:** The AI retains user conversation history and preferences after account creation, enhancing context over time.

### UI and Functionality Specification: Smart Design Elements

The UI and functionality will be designed to make users feel like HomeTruth is a **personal, evolving relationship**, transcending generic AI tools. This is achieved through **dynamic, component-driven UI** integrated with context-aware chat.

**1. Personalization at Every Touchpoint:**

- **Attitudinal Profiling:** An initial **dynamic questionnaire** will capture the user's motivations, fears, tech comfort, risk tolerance, and learning style. This profile will inform all AI interactions and UI layouts.
  - **Example:** A "risk-averse first-time buyer" (Emily) will receive proactive alerts on leasehold pitfalls and simple checklists with frequent reassurance. A "compliance-driven landlord" (Ayesha) will get automated EPC upgrade reminders and legal document summaries with risk scores.
- **Adaptive UI:** Page layouts will be customized based on user profiles.
  - For "low tech comfort" users (e.g., Linda Ellis, 67), the UI will feature larger buttons, minimal choices, and voice-guided maintenance schedules.
  - For "data-driven" users (e.g., Thomas Müller, 41), the UI will surface raw data tables, advanced filters, and self-serve dashboards.
- **Content Customization:** Learning paths, guides, and alerts will be tailored to the user's preferred learning style (e.g., short videos for visual learners vs. data tables for detailed learners).
- **Emotional Adaptation:** AI will detect stress signals in chat history and adjust its tone (e.g., calming language for anxious users, bold nudges for confident investors).

**2. Dynamic, Component-Driven User Interface:**

- The interface will seamlessly blend chat interactions with dynamically assembled UI components.
- **Component Library:** A modular UI library (e.g., React with Chakra UI) will categorize components by user intent and attitudinal traits.
  - **Informational Components:** Budget calculators, EPC rating cards, school catchment maps.
  - **Actionable Components:** Document uploaders, task checklists, grant auto-application forms.
  - **Proactive Components:** Risk alerts, market trend dashboards, deadline reminders.
  - **Emotional Support Components:** Progress trackers, calming animations, reassurance modules.
  - **Transactional Components:** Virtual tour schedulers, digital signature modules.
- **AI-Driven UI Decisions:** The AI maps user inputs and profiles to UI components using intent recognition, attitudinal rules, and contextual triggers.
  - **Example:** If a user expresses worry about "hidden costs" (intent detection) and has a "low risk tolerance" (profile check), the AI will dynamically render a **Document Highlighter** for key clauses, a **Video Guide** on leasehold risks, and a **Task List** for negotiating ground rent.

**3. Dashboard / "My HomeTruth" as a Personal Hub:**

- A centralized dashboard will provide an overview of the user's profile, conversation memory, saved notes, uploaded documents, and bookmarked listings.
- It will be a **responsive design** to avoid clutter for users with many items.

**4. Documentation of Decisions and Actions:**

- Every AI decision and user action will be logged for accountability, auditability, and GDPR compliance.
- **Action Logging:** User ID, timestamp, trigger source (e.g., "chat query: 'Find schools'"), AI reasoning (e.g., "Rendered SchoolFilter due to school mention + user's family focus"), and component metadata will be recorded.
- **User-Facing Transparency:** A small icon (e.g., an 'i') will explain "Why this component?" (e.g., "This map appeared because you mentioned schools"), fostering trust.
- Users will have the option to download their interaction history for GDPR compliance.

By implementing these UI and functionality specifications, HomeTruth will provide a highly intuitive, personalized, and proactive document management system that not only organizes property information but also acts as a trusted advisor throughout the entire homeownership journey.
