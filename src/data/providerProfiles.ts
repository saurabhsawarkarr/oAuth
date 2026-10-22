export interface DeveloperConsoleProfile {
  name: string;
  domain: string;
  officialWebsite: string;
  developerPortal: string;
  category: string;
  authMethod: string;
  managedOAuthAvailable: boolean;
  docUrls: string[];
  consoleNavigationPath: string;
  accountPrerequisites: string[];
  appCreationDetails: {
    menuLocation: string;
    fieldsToFill: string[];
    scopeSelectorLocation: string;
  };
  supportedScopes: Array<{
    name: string;
    description: string;
    category: 'Read' | 'Write' | 'Admin' | 'General';
  }>;
  endpoints: {
    authorization: string;
    token: string;
    revocation?: string;
    discovery?: string;
  };
  redirectUriRules: string;
  sandboxRestrictions: string;
  verificationTriggers: string[];
  requiredDocumentation: string[];
  publishedReviewTimelines: string;
  troubleshootingScenarios: Array<{
    errorCode: string;
    description: string;
    probableCauses: string[];
    resolution: string;
  }>;
  humanActions: string[];
  nextStep: string;
}

export const PROVIDER_PROFILES: Record<string, DeveloperConsoleProfile> = {
  linear: {
    name: 'Linear',
    domain: 'linear.app',
    officialWebsite: 'https://linear.app',
    developerPortal: 'https://linear.app/settings/api',
    category: 'Issue Tracking & Project Management',
    authMethod: 'OAuth 2.0 (Authorization Code Grant with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developers.linear.app/docs/oauth/authentication',
      'https://developers.linear.app/docs/oauth/scopes',
    ],
    consoleNavigationPath: 'Workspace Settings > Security & Access > API > Your OAuth Applications',
    accountPrerequisites: [
      'Active Linear workspace account with Admin permissions to register OAuth apps.',
      'Configured redirect URI (localhost with custom ports fully supported).',
      'Dedicated application name, description, and client icon (512x512px).',
    ],
    appCreationDetails: {
      menuLocation: 'Linear Web App > Settings > API > "+ New Application"',
      fieldsToFill: ['Application Name', 'Developer Website URL', 'Callback URLs', 'Public Application checkbox'],
      scopeSelectorLocation: 'Linear configures scopes at authorization time via the scope query parameter.',
    },
    supportedScopes: [
      { name: 'read', description: 'Read-only access to organization issues, comments, projects, and cycles.', category: 'Read' },
      { name: 'write', description: 'Full create and update access to issues, attachments, comments, and project states.', category: 'Write' },
      { name: 'issues:create', description: 'Granular scope allowing solely creation of new customer issues.', category: 'Write' },
      { name: 'comments:create', description: 'Permits posting comments to issues without reading workspace history.', category: 'Write' },
      { name: 'admin', description: 'Manage organization-level workspace settings and integrations.', category: 'Admin' },
    ],
    endpoints: {
      authorization: 'https://linear.app/oauth/authorize',
      token: 'https://api.linear.app/oauth/token',
      revocation: 'https://api.linear.app/oauth/revoke',
    },
    redirectUriRules: 'Must match registered callback URLs exactly. Localhost with any port (e.g. http://localhost:3000/callback) is permitted for dev.',
    sandboxRestrictions: 'Internal workspace members can authorize the app immediately without review. Public multi-tenant distribution requires external user acceptance.',
    verificationTriggers: [
      'Publishing app to the official Linear Integrations Directory requires submission and brand review.',
      'Personal/internal use requires zero external review.',
    ],
    requiredDocumentation: ['Public Privacy Policy URL', 'Support Contact Email', 'Application Demo Video (for Directory listing)'],
    publishedReviewTimelines: '0 days for direct team authorization; 3–5 business days for official Integrations Directory review.',
    troubleshootingScenarios: [
      {
        errorCode: 'invalid_scope',
        description: 'The requested scope string contains unrecognized or misspelled Linear permissions.',
        probableCauses: ['Requesting scopes with colon errors (e.g., issue:create instead of issues:create).'],
        resolution: 'Update the scope query param in your authorization URL to valid Linear scopes: "read,write".',
      },
      {
        errorCode: 'redirect_uri_mismatch',
        description: 'The redirect_uri query parameter does not match the callback URL registered in Linear settings.',
        probableCauses: ['Protocol discrepancy (http vs https)', 'Missing port or trailing slash differences.'],
        resolution: 'Ensure the redirect_uri in your auth request character-for-character matches Linear Settings > API > Callback URLs.',
      },
    ],
    humanActions: [
      'Log in to Linear as Workspace Admin and navigate to Settings > API.',
      'Click "+ New Application", register callback URLs, and generate Client Secret.',
      'Store Client ID and Client Secret in backend environment variables.',
    ],
    nextStep: 'Register your application at https://linear.app/settings/api and run local token exchange on localhost:3000.',
  },

  spotify: {
    name: 'Spotify Web API',
    domain: 'spotify.com',
    officialWebsite: 'https://spotify.com',
    developerPortal: 'https://developer.spotify.com/dashboard',
    category: 'Media & Audio Streaming',
    authMethod: 'OAuth 2.0 (Authorization Code Flow with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow',
      'https://developer.spotify.com/documentation/web-api/concepts/scopes',
    ],
    consoleNavigationPath: 'Spotify Developer Dashboard > Dashboard > Create App > Settings',
    accountPrerequisites: [
      'Spotify account (Free or Premium) verified with email.',
      'Acceptance of Spotify Developer Terms of Service.',
      'Registered Redirect URI (http://localhost:3000/api/auth/callback/spotify supported).',
    ],
    appCreationDetails: {
      menuLocation: 'developer.spotify.com/dashboard > "Create App"',
      fieldsToFill: ['App name', 'App description', 'Website', 'Redirect URIs', 'API/SDK choice: "Web API"'],
      scopeSelectorLocation: 'Scopes are dynamically requested during user redirect via scope query parameter.',
    },
    supportedScopes: [
      { name: 'user-read-private', description: 'Access user account country, product subscription level, and profile details.', category: 'Read' },
      { name: 'user-read-email', description: 'Access user email address verified with Spotify.', category: 'Read' },
      { name: 'playlist-read-private', description: 'Read private playlists created by the user.', category: 'Read' },
      { name: 'playlist-modify-public', description: 'Create and modify public playlists on user behalf.', category: 'Write' },
      { name: 'user-top-read', description: 'Read user top artists and tracks based on listening history.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://accounts.spotify.com/authorize',
      token: 'https://accounts.spotify.com/api/token',
    },
    redirectUriRules: 'Must be explicitly added to App Settings > Redirect URIs. Strict HTTPS required for production; http://localhost allowed.',
    sandboxRestrictions: 'Development mode strictly limits authorization to up to 25 explicitly invited Spotify accounts registered under "User Management" tab in dashboard.',
    verificationTriggers: [
      'Exceeding 25 users requires requesting a Quota Extension through the Developer Dashboard.',
      'Commercial applications require Spotify Developer Review and approval.',
    ],
    requiredDocumentation: ['Working demo or test account credentials', 'Detailed explanation of why each requested scope is needed'],
    publishedReviewTimelines: 'Immediate (0 days) in Development mode for up to 25 users; ~10–14 business days for quota extension approval.',
    troubleshootingScenarios: [
      {
        errorCode: 'INVALID_CLIENT: Invalid redirect URI',
        description: 'The redirect_uri parameter in your request has not been added to the whitelist in Spotify Developer Dashboard.',
        probableCauses: ['Missing URI in dashboard', 'Trailing slash mismatch', 'Encoding issues in redirect_uri parameter.'],
        resolution: 'Open developer.spotify.com/dashboard > Select App > Settings > Add your exact callback URL to Redirect URIs and click Save.',
      },
      {
        errorCode: 'User not registered in Developer Dashboard (Development Mode)',
        description: 'Non-whitelisted user attempted to authorize an app running in Development mode.',
        probableCauses: ['App is in Development mode and user email is not in User Management list.'],
        resolution: 'Go to Spotify Dashboard > App > User Management > Add the user email and name, or request Quota Extension.',
      },
    ],
    humanActions: [
      'Log in to https://developer.spotify.com/dashboard and click "Create App".',
      'Go to App Settings > Add http://localhost:3000/api/auth/callback/spotify to Redirect URIs and click Save.',
      'Copy Client ID and click "View client secret" to copy Client Secret into backend .env.',
    ],
    nextStep: 'Add redirect URI to Spotify Developer Dashboard and test PKCE authorization flow on localhost:3000.',
  },

  figma: {
    name: 'Figma',
    domain: 'figma.com',
    officialWebsite: 'https://figma.com',
    developerPortal: 'https://www.figma.com/developers/api',
    category: 'Design & Collaboration',
    authMethod: 'OAuth 2.0 (Authorization Code Grant)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://www.figma.com/developers/api#oauth2',
      'https://www.figma.com/developers/api#authentication',
    ],
    consoleNavigationPath: 'Figma App > Account Settings > Security / Developer > OAuth apps',
    accountPrerequisites: [
      'Active Figma account (Starter, Professional, or Enterprise).',
      'Designated public HTTPS callback URL (localhost supported during development).',
    ],
    appCreationDetails: {
      menuLocation: 'Figma Settings > Security > "OAuth apps" > "Create a new app"',
      fieldsToFill: ['App name', 'Website URL', 'Callback URL'],
      scopeSelectorLocation: 'Scopes specified via query parameter during authorization URL generation.',
    },
    supportedScopes: [
      { name: 'file_read', description: 'Read design files, layers, components, and export visual assets.', category: 'Read' },
      { name: 'file_comments:write', description: 'Post comments and feedback on design files on behalf of user.', category: 'Write' },
      { name: 'webhooks:write', description: 'Create and manage file update webhooks for automated workflows.', category: 'Write' },
    ],
    endpoints: {
      authorization: 'https://www.figma.com/oauth',
      token: 'https://www.figma.com/api/v2/oauth/token',
    },
    redirectUriRules: 'Must match registered callback URL exactly. Figma rejects redirects with unlisted query parameters or ports.',
    sandboxRestrictions: 'Internal use and team testing are unrestricted. App directory publication requires manual review.',
    verificationTriggers: [
      'Submitting to Figma Community / Plugin & Widget marketplace triggers review.',
      'Private/custom integrations require zero external review.',
    ],
    requiredDocumentation: ['Privacy Policy URL', 'App icon and support email for Community listings'],
    publishedReviewTimelines: '0 days for direct OAuth; 5–10 business days if submitted to Figma Community.',
    troubleshootingScenarios: [
      {
        errorCode: 'redirect_uri_mismatch',
        description: 'Redirect URI in authorization request does not match Figma developer settings.',
        probableCauses: ['Port mismatch or missing trailing slash.'],
        resolution: 'Check Figma Settings > Security > OAuth apps > Edit app and align the callback URL.',
      },
    ],
    humanActions: [
      'Open Figma Settings > Security tab and click "Create a new app" under OAuth apps.',
      'Copy Client ID and single-view Client Secret into backend environment configuration.',
    ],
    nextStep: 'Create app in Figma Settings and initiate authorization redirect to https://www.figma.com/oauth.',
  },

  hubspot: {
    name: 'HubSpot',
    domain: 'hubspot.com',
    officialWebsite: 'https://hubspot.com',
    developerPortal: 'https://developers.hubspot.com',
    category: 'CRM & Marketing Automation',
    authMethod: 'OAuth 2.0 (Authorization Code Grant)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developers.hubspot.com/docs/api/working-with-oauth',
      'https://developers.hubspot.com/docs/api/app-listing-requirements',
    ],
    consoleNavigationPath: 'HubSpot Developer Account > Manage Apps > Create App > Auth tab',
    accountPrerequisites: [
      'Free HubSpot Developer Account (standard HubSpot customer portal accounts cannot create public OAuth apps; mandatory prerequisite before setup can begin).',
      'Test portal account for sandbox verification.',
      'Redirect URI (registered with HubSpot; HTTPS generally required for deployed applications, localhost allowed for local development).',
    ],
    appCreationDetails: {
      menuLocation: 'Developer Portal > Apps > "Create app"',
      fieldsToFill: ['App name', 'Description', 'Logo', 'Auth Tab: Redirect URLs, Scopes'],
      scopeSelectorLocation: 'Configured in the "Auth" tab of the app settings under "Scopes".',
    },
    supportedScopes: [
      { name: 'crm.objects.contacts.read', description: 'Read CRM contacts and company associations.', category: 'Read' },
      { name: 'crm.objects.contacts.write', description: 'Create and update contacts and lifecycle stages.', category: 'Write' },
      { name: 'crm.objects.deals.read', description: 'Read deal pipelines, stages, and revenue metrics.', category: 'Read' },
      { name: 'crm.schemas.custom.read', description: 'Read custom CRM object schemas.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://app.hubspot.com/oauth/authorize',
      token: 'https://api.hubspot.com/oauth/v1/token',
    },
    redirectUriRules:
      'Redirect URI requirements: Must match the URI registered with the provider. HTTPS is generally required for deployed applications; localhost exceptions may apply during development. Confirm the exact rules for the selected provider and app type.',
    sandboxRestrictions: 'Apps can be installed in developer test portals immediately. Production customer portals require verified scopes.',
    verificationTriggers: [
      'App Marketplace listing requires security check, listing review, and verified domains.',
    ],
    requiredDocumentation: ['App Marketplace Listing Submission', 'Terms of Service URL', 'Privacy Policy URL'],
    publishedReviewTimelines:
      'Review timeline: Not confirmed for this app and distribution path. Check the provider\'s current review guidance before planning your launch.',
    troubleshootingScenarios: [
      {
        errorCode: 'BAD_SCOPES',
        description: 'Requested scope not enabled in the app configuration inside the HubSpot Developer Portal.',
        probableCauses: ['Scope was added to code request without selecting it in the developer portal Auth tab.'],
        resolution: 'Go to HubSpot Developer Dashboard > Apps > Auth > Scopes and check the box for the requested scope.',
      },
    ],
    humanActions: [
      'Register a free HubSpot Developer Account at https://developers.hubspot.com.',
      'Create App > Auth Tab > Add Redirect URL and select required CRM scopes.',
      'Save Client ID and Client Secret in backend env.',
    ],
    nextStep: 'Create test portal in HubSpot Developer Account and execute authorization test.',
  },

  discord: {
    name: 'Discord',
    domain: 'discord.com',
    officialWebsite: 'https://discord.com',
    developerPortal: 'https://discord.com/developers/applications',
    category: 'Communication & Community',
    authMethod: 'OAuth 2.0 (Authorization Code Grant with Bot Integration)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://discord.com/developers/docs/topics/oauth2',
      'https://discord.com/developers/docs/topics/oauth2#authorization-code-grant',
    ],
    consoleNavigationPath: 'Discord Developer Portal > Applications > Select App > OAuth2 tab',
    accountPrerequisites: [
      'Verified Discord account with Two-Factor Authentication (2FA) enabled.',
      'Development server / guild to test bot permissions.',
    ],
    appCreationDetails: {
      menuLocation: 'discord.com/developers/applications > "New Application"',
      fieldsToFill: ['App Name', 'OAuth2 > Redirects', 'Bot > Add Bot (optional)'],
      scopeSelectorLocation: 'OAuth2 > URL Generator tab in developer dashboard.',
    },
    supportedScopes: [
      { name: 'identify', description: 'Allows /users/@me without email to view username, avatar, and discriminator.', category: 'Read' },
      { name: 'email', description: 'Enables access to user email address.', category: 'Read' },
      { name: 'guilds', description: 'Allows viewing which servers user is a member of.', category: 'Read' },
      { name: 'bot', description: 'Installs associated bot into target server with specified permissions.', category: 'General' },
    ],
    endpoints: {
      authorization: 'https://discord.com/api/oauth2/authorize',
      token: 'https://discord.com/api/oauth2/token',
      revocation: 'https://discord.com/api/oauth2/token/revoke',
    },
    redirectUriRules: 'Must match registered Redirects under OAuth2 tab. Localhost (http://localhost:3000) allowed.',
    sandboxRestrictions: 'Unverified bots can join up to 100 Discord servers before requiring Discord Bot Verification.',
    verificationTriggers: [
      'Reaching 75 servers triggers requirement to verify bot with government ID before hitting 100 server cap.',
    ],
    requiredDocumentation: ['Government photo ID verification via Persona (when bot reaches 75 servers)'],
    publishedReviewTimelines: 'Instant (0 days) for under 100 servers; 5–7 business days for bot verification review.',
    troubleshootingScenarios: [
      {
        errorCode: 'invalid_request (Invalid redirect_uri)',
        description: 'The redirect_uri specified in request does not match whitelist in Discord developer portal.',
        probableCauses: ['Redirect URI not added under OAuth2 > Redirects.'],
        resolution: 'Add exact callback URI in Discord Developer Portal > OAuth2 > Redirects and click Save Changes.',
      },
    ],
    humanActions: [
      'Visit https://discord.com/developers/applications and click "New Application".',
      'Under OAuth2 tab, click "Add Redirect" and enter your callback URL.',
      'Copy Client ID and reset Client Secret to store in .env.',
    ],
    nextStep: 'Use OAuth2 > URL Generator in Discord dashboard to test authorization grant on localhost:3000.',
  },

  asana: {
    name: 'Asana',
    domain: 'asana.com',
    officialWebsite: 'https://asana.com',
    developerPortal: 'https://app.asana.com/0/developer-console',
    category: 'Project Management & Collaboration',
    authMethod: 'OAuth 2.0 (Authorization Code with PKCE)',
    managedOAuthAvailable: true,
    docUrls: ['https://developers.asana.com/docs/oauth'],
    consoleNavigationPath: 'Asana App > Profile Avatar > Settings > Apps > Developer Console',
    accountPrerequisites: ['Active Asana account with access to a test workspace.'],
    appCreationDetails: {
      menuLocation: 'Developer Console > "+ New App"',
      fieldsToFill: ['App name', 'Workspace/Organization', 'Redirect URLs'],
      scopeSelectorLocation: 'Asana uses default unified user-inherited permissions.',
    },
    supportedScopes: [
      { name: 'default', description: 'Inherits all project, task, and workspace access granted to the authorizing user.', category: 'General' },
    ],
    endpoints: {
      authorization: 'https://app.asana.com/-/oauth_authorize',
      token: 'https://app.asana.com/-/oauth_token',
    },
    redirectUriRules: 'Must be HTTPS for production; http://localhost allowed for development.',
    sandboxRestrictions: 'Direct authorization works immediately within your organization.',
    verificationTriggers: ['App Directory listing requires review by Asana Platform team.'],
    requiredDocumentation: ['Support URL', 'Privacy Policy URL (for directory listing)'],
    publishedReviewTimelines: '0 days for internal apps; 1–2 weeks for Asana App Directory review.',
    troubleshootingScenarios: [
      {
        errorCode: 'invalid_grant',
        description: 'Authorization code expired or already used.',
        probableCauses: ['Code was exchanged more than once or expired after 10 minutes.'],
        resolution: 'Re-initiate authorization redirect to get a fresh authorization code.',
      },
    ],
    humanActions: [
      'Open Asana > Profile Avatar > Settings > Apps > Developer Console.',
      'Click "+ New App", enter application name, and add Redirect URL.',
      'Copy Client ID and Client Secret into server configuration.',
    ],
    nextStep: 'Create app in Asana Developer Console and initiate authorization redirect.',
  },

  gitlab: {
    name: 'GitLab',
    domain: 'gitlab.com',
    officialWebsite: 'https://gitlab.com',
    developerPortal: 'https://gitlab.com/-/profile/applications',
    category: 'DevOps & Source Code Management',
    authMethod: 'OAuth 2.0 (Authorization Code Grant with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://docs.gitlab.com/ee/integration/oauth_provider.html',
      'https://docs.gitlab.com/ee/api/oauth2.html',
    ],
    consoleNavigationPath: 'GitLab Account > Profile Avatar (top-right) > Edit profile > Applications (or Group Settings > Applications for group-level apps)',
    accountPrerequisites: [
      'GitLab.com account or self-hosted GitLab instance account.',
      'Configured redirect URI (one per line, http://localhost permitted for development).',
    ],
    appCreationDetails: {
      menuLocation: 'GitLab Profile > "Edit profile" > "Applications" in left sidebar > "Add new application"',
      fieldsToFill: ['Name', 'Redirect URI (line-separated)', 'Confidential checkbox (uncheck for native/SPA apps)', 'Scopes checkboxes'],
      scopeSelectorLocation: 'Applications form contains discrete checkboxes for each OAuth scope.',
    },
    supportedScopes: [
      { name: 'read_user', description: 'Grants read-only access to user profile and email addresses.', category: 'Read' },
      { name: 'api', description: 'Grants full read/write access to GitLab REST and GraphQL APIs.', category: 'Admin' },
      { name: 'read_repository', description: 'Grants read access to project code repositories via Git over HTTP.', category: 'Read' },
      { name: 'write_repository', description: 'Grants read and write access to project code repositories.', category: 'Write' },
      { name: 'openid', description: 'Allows authentication using OpenID Connect standard.', category: 'General' },
      { name: 'email', description: 'Grants access to primary email address via OpenID Connect.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://gitlab.com/oauth/authorize',
      token: 'https://gitlab.com/oauth/token',
      revocation: 'https://gitlab.com/oauth/revoke',
    },
    redirectUriRules: 'Must match registered Redirect URI exactly. Enter one URI per line. http://localhost with arbitrary port is supported.',
    sandboxRestrictions: 'Direct authorization is immediate for any user or group where the app is registered. No external app approval required.',
    verificationTriggers: [
      'Self-managed instances or GitLab.com OAuth applications require zero approval queues for organization use.',
    ],
    requiredDocumentation: ['Application Name and Redirect URI'],
    publishedReviewTimelines: '0 days (instant) for personal and group-level applications.',
    troubleshootingScenarios: [
      {
        errorCode: 'invalid_redirect_uri',
        description: 'The redirect_uri provided does not match any URI in GitLab Applications settings.',
        probableCauses: ['Redirect URI not listed line-by-line', 'Trailing slash or port difference.'],
        resolution: 'Add the exact redirect URI to GitLab Profile > Edit profile > Applications > Edit Application.',
      },
      {
        errorCode: 'unauthorized_client',
        description: 'Client authentication failed or confidential application attempted public PKCE without secret.',
        probableCauses: ['Confidential checkbox was checked but client_secret was omitted in token exchange.'],
        resolution: 'Either pass client_secret in token exchange or uncheck Confidential in GitLab app settings.',
      },
    ],
    humanActions: [
      'Log in to GitLab and go to Profile Avatar > Edit profile > Applications.',
      'Fill in Name, add http://localhost:3000/api/auth/callback/gitlab, select scopes, and click "Save application".',
      'Copy Application ID (Client ID) and Secret (Client Secret) into backend environment variables.',
    ],
    nextStep: 'Register app in GitLab Applications settings and test authorization redirect to https://gitlab.com/oauth/authorize.',
  },

  salesforce: {
    name: 'Salesforce',
    domain: 'salesforce.com',
    officialWebsite: 'https://salesforce.com',
    developerPortal: 'https://developer.salesforce.com',
    category: 'Enterprise CRM & Cloud Platform',
    authMethod: 'OAuth 2.0 (Authorization Code Grant with Web Server Flow & PKCE)',
    managedOAuthAvailable: false,
    docUrls: [
      'https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm',
      'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_oauth_and_connected_apps.htm',
    ],
    consoleNavigationPath: 'Salesforce Setup (Gear icon) > Apps > App Manager > "New Connected App"',
    accountPrerequisites: [
      'Salesforce Developer Edition organization or Sandbox organization with "Customize Application" permissions.',
      'Public HTTPS callback URL or http://localhost for local development.',
    ],
    appCreationDetails: {
      menuLocation: 'Setup > Platform Tools > Apps > App Manager > "New Connected App"',
      fieldsToFill: [
        'Connected App Name',
        'API Name',
        'Contact Email',
        'Check "Enable OAuth Settings"',
        'Callback URL',
        'Selected OAuth Scopes (from Available Scopes list)',
      ],
      scopeSelectorLocation: 'App Manager > Enable OAuth Settings > "Selected OAuth Scopes" multi-select box.',
    },
    supportedScopes: [
      { name: 'api', description: 'Manage user data via REST, SOAP, and Bulk APIs.', category: 'Read' },
      { name: 'web', description: 'Provide access to web-based custom applications.', category: 'General' },
      { name: 'refresh_token, offline_access', description: 'Perform requests at any time and receive refresh tokens.', category: 'General' },
      { name: 'id', description: 'Access user unique identifier and identity service URL.', category: 'Read' },
      { name: 'full', description: 'Full access to all Salesforce resources and customer data.', category: 'Admin' },
    ],
    endpoints: {
      authorization: 'https://login.salesforce.com/services/oauth2/authorize',
      token: 'https://login.salesforce.com/services/oauth2/token',
      revocation: 'https://login.salesforce.com/services/oauth2/revoke',
    },
    redirectUriRules: 'Must be HTTPS for production. http://localhost or http://127.0.0.1 permitted for development.',
    sandboxRestrictions: 'Initial Connected App propagation takes 2–10 minutes across Salesforce server clusters before OAuth tokens succeed.',
    verificationTriggers: [
      'Commercial distribution via AppExchange requires Salesforce Security Review and Partner Program enrollment ($999 fee).',
      'Internal org-to-org integrations require zero external review.',
    ],
    requiredDocumentation: ['Security Review Questionnaire (for AppExchange)', 'Admin Credentials for test org'],
    publishedReviewTimelines: '0 days for internal org Connected Apps; 4–8 weeks for AppExchange Security Review.',
    troubleshootingScenarios: [
      {
        errorCode: 'error=invalid_client_id',
        description: 'Salesforce does not recognize Consumer Key or the Connected App has not completed replication.',
        probableCauses: ['App newly created within the last 10 minutes', 'Using login.salesforce.com instead of test.salesforce.com for sandbox.'],
        resolution: 'Wait 10 minutes for Salesforce cluster replication; ensure sandbox orgs use https://test.salesforce.com endpoints.',
      },
      {
        errorCode: 'error=redirect_uri_mismatch',
        description: 'Callback URL does not match Connected App configuration in App Manager.',
        probableCauses: ['Missing port or protocol discrepancy.'],
        resolution: 'Verify App Manager > Connected App > Edit > Callback URL matches the redirect_uri query parameter exactly.',
      },
    ],
    humanActions: [
      'Log in to Salesforce org > Click Setup gear > Search "App Manager".',
      'Click "New Connected App", enable OAuth Settings, add callback URL, select scopes (api, refresh_token), and save.',
      'Click "Manage Consumer Details" to view and copy Consumer Key and Consumer Secret.',
    ],
    nextStep: 'Configure Connected App in Salesforce Setup and wait 10 minutes for replication before testing auth flow.',
  },

  airtable: {
    name: 'Airtable',
    domain: 'airtable.com',
    officialWebsite: 'https://airtable.com',
    developerPortal: 'https://airtable.com/create/oauth',
    category: 'Database & No-Code Platform',
    authMethod: 'OAuth 2.0 (Authorization Code with PKCE Mandatory)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://airtable.com/developers/web/api/oauth-reference',
      'https://airtable.com/developers/web/api/scopes',
    ],
    consoleNavigationPath: 'Airtable > User Profile Avatar > Developer Hub > "OAuth integrations" tab > "Register new OAuth integration"',
    accountPrerequisites: [
      'Airtable account with access to base workspaces.',
      'Pre-generated code_verifier and code_challenge (SHA-256) since Airtable strictly enforces PKCE for all clients.',
    ],
    appCreationDetails: {
      menuLocation: 'airtable.com/create/oauth > "Register new OAuth integration"',
      fieldsToFill: ['OAuth integration name', 'OAuth redirect URL(s)', 'Scope permissions checklist'],
      scopeSelectorLocation: 'Developer Hub OAuth registration modal checklist.',
    },
    supportedScopes: [
      { name: 'data.records:read', description: 'Read records, cells, and metadata within authorized bases.', category: 'Read' },
      { name: 'data.records:write', description: 'Create, update, and delete table records within authorized bases.', category: 'Write' },
      { name: 'schema.bases:read', description: 'Inspect base schema, table schemas, and field types.', category: 'Read' },
      { name: 'schema.bases:write', description: 'Create or modify tables, fields, and views.', category: 'Write' },
      { name: 'user.email:read', description: 'Read authorized user email address.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://airtable.com/oauth/authorize',
      token: 'https://airtable.com/oauth/v2/token',
    },
    redirectUriRules: 'Must match registered Redirect URL character-for-character. Localhost allowed for development.',
    sandboxRestrictions: 'Integrations can be installed across any workspace where the developer is a member. Public distribution requires listing approval.',
    verificationTriggers: [
      'Publishing integration to Airtable Marketplace triggers review.',
      'Internal and unlisted OAuth integrations require no review.',
    ],
    requiredDocumentation: ['Privacy Policy URL', 'Integration Logo (512x512 PNG)'],
    publishedReviewTimelines: '0 days for direct team authorization; 1–2 weeks for Marketplace review.',
    troubleshootingScenarios: [
      {
        errorCode: 'INVALID_REQUEST: code_challenge required',
        description: 'Airtable rejected authorization request because PKCE code_challenge parameter was omitted.',
        probableCauses: ['Standard OAuth 2.0 flow attempted without PKCE.'],
        resolution: 'Generate code_verifier (43-128 chars) and SHA-256 code_challenge, and append code_challenge & code_challenge_method=S256 to auth URL.',
      },
    ],
    humanActions: [
      'Navigate to https://airtable.com/create/oauth and click "Register new OAuth integration".',
      'Provide Integration Name, add http://localhost:3000/api/auth/callback/airtable, select scopes, and click Register.',
      'Copy Client ID and Client Secret into backend environment variables.',
    ],
    nextStep: 'Implement PKCE challenge generation and redirect to https://airtable.com/oauth/authorize.',
  },

  zoom: {
    name: 'Zoom Video Communications',
    domain: 'zoom.us',
    officialWebsite: 'https://zoom.us',
    developerPortal: 'https://marketplace.zoom.us/develop/create',
    category: 'Video Conferencing & Unified Communications',
    authMethod: 'OAuth 2.0 (User-level & Account-level Apps with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developers.zoom.us/docs/integrations/oauth/',
      'https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/',
    ],
    consoleNavigationPath: 'Zoom App Marketplace (marketplace.zoom.us) > Develop > "Build App" > OAuth',
    accountPrerequisites: [
      'Zoom account with Developer role permissions enabled in Admin settings.',
      'Defined app distribution intention (Account-level for organization-wide or User-managed for individual participants).',
    ],
    appCreationDetails: {
      menuLocation: 'marketplace.zoom.us > Develop > "Build App" > "General App" / "OAuth"',
      fieldsToFill: ['App Name', 'Choose app type: User-managed or Account-managed', 'Redirect URL for OAuth', 'Add Allow Lists'],
      scopeSelectorLocation: 'App build dashboard > "Scopes" tab > "Add Scopes" button.',
    },
    supportedScopes: [
      { name: 'meeting:read:admin', description: 'View all meeting details and recordings across organization.', category: 'Read' },
      { name: 'meeting:write:admin', description: 'Create, update, and schedule meetings on behalf of users.', category: 'Write' },
      { name: 'user:read:admin', description: 'View user profile, department, and settings.', category: 'Read' },
      { name: 'recording:read:admin', description: 'Access cloud recording files and transcripts.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://zoom.us/oauth/authorize',
      token: 'https://zoom.us/oauth/token',
      revocation: 'https://zoom.us/oauth/revoke',
    },
    redirectUriRules: 'Strict HTTPS enforced for production. http://localhost permitted for local dev. Must also add domains to OAuth Allow List.',
    sandboxRestrictions: 'Development credentials allow unlimited local testing within the developer Zoom account before submission.',
    verificationTriggers: [
      'Publishing app on Zoom App Marketplace requires technical review, functional testing, and security audit.',
    ],
    requiredDocumentation: ['Privacy Policy URL', 'Terms of Use URL', 'Security Documentation & Test Account Credentials'],
    publishedReviewTimelines: '0 days for Development credentials in host account; 2–4 weeks for Marketplace publication review.',
    troubleshootingScenarios: [
      {
        errorCode: 'Invalid redirect: {url} does not match one of the registered allow lists',
        description: 'The redirect URI domain was not added to the OAuth Allow List in Zoom Developer dashboard.',
        probableCauses: ['Redirect URL added under Redirect, but domain not added under "OAuth allow list".'],
        resolution: 'Add both the full redirect URL and the base origin (e.g. http://localhost:3000) under OAuth Allow List.',
      },
    ],
    humanActions: [
      'Visit https://marketplace.zoom.us/develop/create and choose General App / OAuth.',
      'Fill in App Name, add http://localhost:3000/api/auth/callback/zoom, and add origin to OAuth Allow List.',
      'Under App Credentials, copy Client ID and Client Secret into .env.',
    ],
    nextStep: 'Build Zoom app in Marketplace and execute test authorization flow on localhost:3000.',
  },

  stripe: {
    name: 'Stripe Connect',
    domain: 'stripe.com',
    officialWebsite: 'https://stripe.com',
    developerPortal: 'https://dashboard.stripe.com/settings/connect',
    category: 'Payments & Financial Infrastructure',
    authMethod: 'OAuth 2.0 (Stripe Connect Standard & Express Onboarding)',
    managedOAuthAvailable: false,
    docUrls: [
      'https://docs.stripe.com/connect/oauth-reference',
      'https://docs.stripe.com/connect/standard-accounts',
    ],
    consoleNavigationPath: 'Stripe Dashboard > Settings > Connect > Settings > Integration > "OAuth settings"',
    accountPrerequisites: [
      'Active Stripe account with Connect enabled.',
      'Configured redirect URIs separated by Test mode and Live mode.',
    ],
    appCreationDetails: {
      menuLocation: 'Stripe Dashboard > Settings > Connect > Settings > "OAuth settings"',
      fieldsToFill: ['Redirects (Test mode and Live mode)', 'OAuth authorization toggle: Enabled'],
      scopeSelectorLocation: 'Scope is passed dynamically in the authorization query parameter (read_write or read_only).',
    },
    supportedScopes: [
      { name: 'read_write', description: 'Grants full read/write API access to connected merchant account data and charges.', category: 'Admin' },
      { name: 'read_only', description: 'Grants read-only access to customer balances, charges, and payouts.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://connect.stripe.com/oauth/authorize',
      token: 'https://connect.stripe.com/oauth/token',
      revocation: 'https://connect.stripe.com/oauth/deauthorize',
    },
    redirectUriRules: 'Separate whitelists for Test mode and Live mode. Localhost allowed in Test mode; HTTPS strictly required in Live mode.',
    sandboxRestrictions: 'Test mode uses client_id starting with "ca_..." and test secret key starting with "sk_test_...". Instant sandbox testing.',
    verificationTriggers: [
      'Live account onboarding requires Stripe identity verification and active business registration.',
    ],
    requiredDocumentation: ['Business Tax ID', 'Bank Account Details', 'Platform Terms of Service'],
    publishedReviewTimelines: '0 days for Connect Test mode; instantaneous for Live mode upon business identity verification.',
    troubleshootingScenarios: [
      {
        errorCode: 'invalid_redirect_uri',
        description: 'Redirect URI is not registered in Stripe Connect Settings.',
        probableCauses: ['URI registered in Live mode but requested in Test mode, or vice versa.'],
        resolution: 'Open Stripe Dashboard > Settings > Connect > Settings > OAuth settings > Ensure URI is in Test mode redirects.',
      },
    ],
    humanActions: [
      'Log in to Stripe Dashboard > Go to Settings > Connect > Settings > Integration.',
      'Toggle OAuth ON, and add http://localhost:3000/api/auth/callback/stripe to Test mode redirects.',
      'Copy Connect Client ID (ca_...) and secret key (sk_test_...) into server .env.',
    ],
    nextStep: 'Enable OAuth in Stripe Connect settings and test connected account authorization on localhost:3000.',
  },

  dropbox: {
    name: 'Dropbox',
    domain: 'dropbox.com',
    officialWebsite: 'https://dropbox.com',
    developerPortal: 'https://www.dropbox.com/developers/apps',
    category: 'Cloud Storage & File Collaboration',
    authMethod: 'OAuth 2.0 (Authorization Code with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize',
      'https://www.dropbox.com/developers/reference/oauth-guide',
    ],
    consoleNavigationPath: 'Dropbox App Console (dropbox.com/developers/apps) > "Create app"',
    accountPrerequisites: [
      'Dropbox account with verified email address.',
      'App access type decision: "Full Dropbox" (all user files) or "App folder" (isolated sandbox directory).',
    ],
    appCreationDetails: {
      menuLocation: 'dropbox.com/developers/apps > "Create app"',
      fieldsToFill: ['Choose API: Scoped access', 'Type of access: Full Dropbox or App folder', 'Name your app'],
      scopeSelectorLocation: 'App Console > Select App > "Permissions" tab.',
    },
    supportedScopes: [
      { name: 'files.metadata.read', description: 'View metadata for user files and folders.', category: 'Read' },
      { name: 'files.metadata.write', description: 'Edit metadata and tags for user files.', category: 'Write' },
      { name: 'files.content.read', description: 'Download file contents and streams.', category: 'Read' },
      { name: 'files.content.write', description: 'Upload and edit user file contents.', category: 'Write' },
      { name: 'account_info.read', description: 'View user profile and email address.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://www.dropbox.com/oauth2/authorize',
      token: 'https://api.dropboxapi.com/oauth2/token',
      revocation: 'https://api.dropboxapi.com/2/auth/token/revoke',
    },
    redirectUriRules: 'Must be added under App Console > Settings > OAuth 2 > Redirect URIs. Strict HTTPS except http://localhost.',
    sandboxRestrictions: 'Apps in "Development" status are restricted to a maximum of 500 connected users.',
    verificationTriggers: [
      'Applying for "Production" status (to exceed 500 users) requires Dropbox platform review.',
    ],
    requiredDocumentation: ['App description', 'Privacy Policy URL for production status'],
    publishedReviewTimelines: '0 days (instant) for Development status up to 500 users; 2–5 business days for Production status review.',
    troubleshootingScenarios: [
      {
        errorCode: 'Invalid redirect_uri: {uri}',
        description: 'Redirect URI in auth request has not been added to Dropbox App Console whitelist.',
        probableCauses: ['Missing port or trailing slash mismatch.'],
        resolution: 'Add exact callback URI under App Console > App Settings > OAuth 2 > Redirect URIs and click Add.',
      },
    ],
    humanActions: [
      'Visit https://www.dropbox.com/developers/apps and click "Create app".',
      'Select Scoped access, choose App folder or Full Dropbox, name the app, and click Create.',
      'In Permissions tab, select files.content.read and write, and add redirect URI in Settings tab.',
    ],
    nextStep: 'Create app in Dropbox App Console and test OAuth PKCE flow on localhost:3000.',
  },

  shopify: {
    name: 'Shopify',
    domain: 'shopify.com',
    officialWebsite: 'https://shopify.com',
    developerPortal: 'https://partners.shopify.com',
    category: 'E-Commerce & Merchant Platform',
    authMethod: 'OAuth 2.0 (Merchant Store Installation Flow with HMAC Verification)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://shopify.dev/docs/apps/build/authentication-authorization',
      'https://shopify.dev/docs/api/admin-rest/current/resources/oauth',
    ],
    consoleNavigationPath: 'Shopify Partners Dashboard (partners.shopify.com) > Apps > "Create app" > "Create app manually"',
    accountPrerequisites: [
      'Shopify Partners account (free registration).',
      'Development store created inside Partners Dashboard for sandbox testing.',
      'Public HTTPS callback URL (tunneling via Cloudflare/ngrok required for local dev).',
    ],
    appCreationDetails: {
      menuLocation: 'partners.shopify.com > Apps > "Create app" > "Create app manually"',
      fieldsToFill: ['App name', 'App URL', 'Allowed redirection URL(s)'],
      scopeSelectorLocation: 'Scopes defined in shopify.app.toml or requested dynamically via scope query param.',
    },
    supportedScopes: [
      { name: 'read_products', description: 'Read merchant store product catalog, variants, and inventory.', category: 'Read' },
      { name: 'write_products', description: 'Create and modify products, collections, and pricing.', category: 'Write' },
      { name: 'read_orders', description: 'View customer orders and fulfillment states.', category: 'Read' },
      { name: 'write_orders', description: 'Update order status and fulfillment tracking.', category: 'Write' },
      { name: 'read_customers', description: 'Access customer records and contact information.', category: 'Read' },
    ],
    endpoints: {
      authorization: 'https://{shop}.myshopify.com/admin/oauth/authorize',
      token: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    },
    redirectUriRules: 'Strict HTTPS enforced; Shopify does not allow plain HTTP localhost. Local dev requires HTTPS tunnel (e.g. https://xxx.ngrok-free.app/api/auth/callback).',
    sandboxRestrictions: 'Development stores allow instant unlimited testing without review. Public App Store distribution requires comprehensive App Review.',
    verificationTriggers: [
      'Listing on Shopify App Store requires Automated App Submission checks and manual merchant review.',
    ],
    requiredDocumentation: ['Privacy Policy URL', 'App Icon (1200x1200px)', 'Emergency developer contact email'],
    publishedReviewTimelines: '0 days for Partner development store testing; 5–7 business days for Shopify App Store review.',
    troubleshootingScenarios: [
      {
        errorCode: 'Oauth error invalid_request: The redirect_uri is not whitelisted',
        description: 'The redirect_uri provided does not match any allowed redirection URL in Partners Dashboard.',
        probableCauses: ['Using http instead of https', 'Tunnel URL expired and was not updated in dashboard.'],
        resolution: 'Update Allowed Redirection URLs in Partners Dashboard > App Setup with your active HTTPS callback URL.',
      },
    ],
    humanActions: [
      'Register free Shopify Partners account at https://partners.shopify.com.',
      'Go to Apps > Create app > Create app manually, provide name and HTTPS callback URL.',
      'Copy Client ID and Client Secret from App Credentials tab into backend config.',
    ],
    nextStep: 'Create development store in Shopify Partners and initiate merchant authorization flow.',
  },

  box: {
    name: 'Box',
    domain: 'box.com',
    officialWebsite: 'https://box.com',
    developerPortal: 'https://app.box.com/developers/console',
    category: 'Enterprise Content Management & Cloud Storage',
    authMethod: 'OAuth 2.0 (User Authentication Flow with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developer.box.com/guides/authentication/oauth2/',
      'https://developer.box.com/guides/applications/custom-apps/',
    ],
    consoleNavigationPath: 'Box Developer Console (app.box.com/developers/console) > "Create New App" > "Custom App"',
    accountPrerequisites: [
      'Box account with developer console access enabled.',
      'Selected authentication method: "User Authentication (OAuth 2.0)".',
    ],
    appCreationDetails: {
      menuLocation: 'Box Developer Console > "Create New App" > "Custom App"',
      fieldsToFill: ['App Name', 'Purpose', 'Authentication Method: User Authentication (OAuth 2.0)', 'Redirect URI'],
      scopeSelectorLocation: 'App Developer Console > "Configuration" tab > "Application Scopes" checkboxes.',
    },
    supportedScopes: [
      { name: 'root_readwrite', description: 'Read and write all files and folders stored in Box on behalf of user.', category: 'Write' },
      { name: 'manage_webhook', description: 'Create and delete webhooks for enterprise file events.', category: 'Admin' },
      { name: 'manage_groups', description: 'Inspect and manage corporate user groups.', category: 'Admin' },
    ],
    endpoints: {
      authorization: 'https://account.box.com/api/oauth2/authorize',
      token: 'https://api.box.com/oauth2/token',
      revocation: 'https://api.box.com/oauth2/revoke',
    },
    redirectUriRules: 'Must match registered Redirect URI under App Configuration tab. http://localhost supported for local dev.',
    sandboxRestrictions: 'Direct authorization works immediately within developer account. Enterprise deployment requires Box Admin authorization.',
    verificationTriggers: [
      'Listing in Box App Center requires partner review and security compliance validation.',
    ],
    requiredDocumentation: ['Privacy Policy URL', 'Terms of Service URL'],
    publishedReviewTimelines: '0 days for direct testing in developer account; 1–3 weeks for Box App Center publication.',
    troubleshootingScenarios: [
      {
        errorCode: 'redirect_uri_mismatch',
        description: 'The redirect_uri parameter in auth URL does not match Configuration tab.',
        probableCauses: ['Port or path mismatch in Box Developer Console.'],
        resolution: 'Add exact callback URL in Box Developer Console > Select App > Configuration > OAuth 2.0 Redirect URI.',
      },
    ],
    humanActions: [
      'Log in to https://app.box.com/developers/console and click "Create New App".',
      'Select Custom App > User Authentication (OAuth 2.0), enter app name, and click Create App.',
      'Under Configuration tab, add Redirect URI, select Application Scopes, and save changes.',
    ],
    nextStep: 'Configure Redirect URI in Box Developer Console and test user authorization grant.',
  },

  twitter: {
    name: 'X (Twitter)',
    domain: 'x.com',
    officialWebsite: 'https://x.com',
    developerPortal: 'https://developer.x.com/en/portal/dashboard',
    category: 'Social Media & Microblogging',
    authMethod: 'OAuth 2.0 (Authorization Code with PKCE Mandatory)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developer.x.com/en/docs/authentication/oauth-2-0/authorization-code',
      'https://developer.x.com/en/docs/authentication/oauth-2-0/user-access-token',
    ],
    consoleNavigationPath: 'X Developer Portal (developer.x.com) > Projects & Apps > Select App > "User authentication settings" > "Set up"',
    accountPrerequisites: [
      'Verified X account with active phone number.',
      'Enrolled in X Developer Platform (Free or Basic tier).',
      'Mandatory PKCE parameters (code_challenge & code_verifier) implemented.',
    ],
    appCreationDetails: {
      menuLocation: 'Developer Portal > Projects & Apps > Select App > "User authentication settings"',
      fieldsToFill: [
        'App permissions (Read or Read and write)',
        'Type of App (Web App, Automated App, or Native App)',
        'Callback URI / Redirect URL',
        'Website URL',
      ],
      scopeSelectorLocation: 'Permissions chosen in portal determine which scopes (tweet.read, tweet.write, users.read) can be requested.',
    },
    supportedScopes: [
      { name: 'tweet.read', description: 'Read user Tweets and timeline in real-time.', category: 'Read' },
      { name: 'tweet.write', description: 'Post and delete Tweets on behalf of authorized user.', category: 'Write' },
      { name: 'users.read', description: 'Access user profile details, follower count, and verification status.', category: 'Read' },
      { name: 'offline.access', description: 'Receives refresh token for persistent offline authorization.', category: 'General' },
    ],
    endpoints: {
      authorization: 'https://twitter.com/i/oauth2/authorize',
      token: 'https://api.twitter.com/2/oauth2/token',
      revocation: 'https://api.twitter.com/2/oauth2/revoke',
    },
    redirectUriRules: 'Exact match required. Must be added to Callback URI / Redirect URL list in Developer Portal.',
    sandboxRestrictions: 'Free tier permits 1 Project with 1 App and monthly limits on Tweet write requests.',
    verificationTriggers: [
      'Upgrading to Basic or Pro API tiers requires monthly paid subscription ($100/mo or $5,000/mo).',
    ],
    requiredDocumentation: ['Terms of Service URL', 'Privacy Policy URL'],
    publishedReviewTimelines: '0 days (instant) for standard Free/Basic Developer Portal apps.',
    troubleshootingScenarios: [
      {
        errorCode: 'invalid_request: Missing code_challenge',
        description: 'X OAuth 2.0 strictly requires PKCE code_challenge in authorization URL.',
        probableCauses: ['Standard OAuth 2.0 attempted without PKCE.'],
        resolution: 'Generate code_verifier, compute SHA-256 code_challenge, and add code_challenge & code_challenge_method=S256 to auth URL.',
      },
    ],
    humanActions: [
      'Open https://developer.x.com/en/portal/dashboard and navigate to your App settings.',
      'Click "Set up" under User authentication settings, select Web App, and add callback URL.',
      'Save Client ID and Client Secret in backend environment variables.',
    ],
    nextStep: 'Configure User Authentication Settings in X Developer Portal and test PKCE flow.',
  },

  atlassian: {
    name: 'Atlassian (Jira / Confluence)',
    domain: 'atlassian.com',
    officialWebsite: 'https://atlassian.com',
    developerPortal: 'https://developer.atlassian.com/console/myapps',
    category: 'Agile Project Management & Team Collaboration',
    authMethod: 'OAuth 2.0 (3LO - Three-Legged OAuth with PKCE)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/',
      'https://developer.atlassian.com/cloud/jira/platform/scopes-for-oauth-2-3LO-and-forge-apps/',
    ],
    consoleNavigationPath: 'Atlassian Developer Console (developer.atlassian.com/console/myapps) > "Create" > "OAuth 2.0 (3LO) integration"',
    accountPrerequisites: [
      'Atlassian account with access to a Jira Cloud test site or sandbox.',
      'Configured HTTPS or localhost callback URL.',
    ],
    appCreationDetails: {
      menuLocation: 'developer.atlassian.com/console/myapps > "Create" > "OAuth 2.0 (3LO) integration"',
      fieldsToFill: ['App name', 'Permissions tab > Add API (Jira platform REST API)', 'Authorization tab > Add Callback URL'],
      scopeSelectorLocation: 'App Console > "Permissions" tab > Select Jira or Confluence API > Configure scopes.',
    },
    supportedScopes: [
      { name: 'read:jira-work', description: 'Read Jira project issues, worklogs, sprints, and comments.', category: 'Read' },
      { name: 'write:jira-work', description: 'Create and update Jira issues, transition workflows, and add attachments.', category: 'Write' },
      { name: 'read:jira-user', description: 'View user profile, display name, and account ID in Jira.', category: 'Read' },
      { name: 'offline_access', description: 'Receive refresh token for renewing Jira access tokens without re-prompting.', category: 'General' },
    ],
    endpoints: {
      authorization: 'https://auth.atlassian.com/authorize',
      token: 'https://auth.atlassian.com/oauth/token',
    },
    redirectUriRules: 'Must match registered Callback URL in Authorization tab. Localhost allowed for development.',
    sandboxRestrictions: 'Direct authorization works immediately on any Jira Cloud site where the developer is an admin or invited user.',
    verificationTriggers: [
      'Publishing app on Atlassian Marketplace requires developer verification and security screening.',
    ],
    requiredDocumentation: ['Privacy Policy URL', 'Support Contact URL for Marketplace listings'],
    publishedReviewTimelines: '0 days for direct site installation; 5–10 business days for Atlassian Marketplace review.',
    troubleshootingScenarios: [
      {
        errorCode: 'redirect_uri_mismatch',
        description: 'The redirect_uri provided does not match the registered callback in Atlassian Developer Console.',
        probableCauses: ['Missing port or protocol discrepancy.'],
        resolution: 'Go to developer.atlassian.com/console/myapps > App > Authorization > Add exact callback URL.',
      },
    ],
    humanActions: [
      'Open https://developer.atlassian.com/console/myapps and click "Create" > "OAuth 2.0 (3LO) integration".',
      'Under Permissions tab, add "Jira platform REST API" and select read:jira-work and write:jira-work.',
      'Under Authorization tab, add http://localhost:3000/api/auth/callback/atlassian, and copy Client ID & Secret from Settings tab.',
    ],
    nextStep: 'Add Jira API permissions in Atlassian Console and test 3LO authorization redirect.',
  },

  microsoft: {
    name: 'Microsoft Entra ID (Azure AD)',
    domain: 'microsoft.com',
    officialWebsite: 'https://azure.microsoft.com',
    developerPortal: 'https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps',
    category: 'Identity & Access Management / Cloud Platform',
    authMethod: 'OAuth 2.0 (Authorization Code with PKCE via Microsoft Identity Platform v2.0)',
    managedOAuthAvailable: true,
    docUrls: [
      'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow',
      'https://learn.microsoft.com/en-us/entra/identity-platform/permissions-consent-overview',
    ],
    consoleNavigationPath: 'Microsoft Azure Portal (portal.azure.com) > "Microsoft Entra ID" > "App registrations" > "New registration"',
    accountPrerequisites: [
      'Microsoft Azure account (free tier eligible) or Microsoft 365 Developer tenant.',
      'Supported account types choice: Single tenant (internal org only) or Multitenant (any work/school/personal account).',
    ],
    appCreationDetails: {
      menuLocation: 'portal.azure.com > Microsoft Entra ID > "App registrations" > "New registration"',
      fieldsToFill: [
        'Name',
        'Supported account types (e.g. Accounts in any organizational directory and personal Microsoft accounts)',
        'Redirect URI (Select Web or Single-page application and enter URL)',
      ],
      scopeSelectorLocation: 'App registration > "API permissions" tab > "Add a permission" > "Microsoft Graph".',
    },
    supportedScopes: [
      { name: 'User.Read', description: 'Sign in and read user profile in Microsoft Graph.', category: 'Read' },
      { name: 'Mail.Read', description: 'Read user email messages and mailbox folders.', category: 'Read' },
      { name: 'Files.ReadWrite', description: 'Read and write files in OneDrive and SharePoint on behalf of user.', category: 'Write' },
      { name: 'offline_access', description: 'Maintain access to data via refresh tokens.', category: 'General' },
      { name: 'openid', description: 'Sign users in with OpenID Connect.', category: 'General' },
    ],
    endpoints: {
      authorization: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    },
    redirectUriRules: 'Must match registered platform Redirect URI. Web platform supports http://localhost with any port for development.',
    sandboxRestrictions: 'Direct authorization is immediate for users within the home tenant or personal accounts.',
    verificationTriggers: [
      'Multi-tenant apps requesting sensitive permissions require Publisher Verification (MPN ID & Dun & Bradstreet audit).',
    ],
    requiredDocumentation: ['Microsoft Partner Network (MPN) ID for verified publisher badge'],
    publishedReviewTimelines: '0 days for direct testing and unverified multitenant apps; 3–5 business days for MPN publisher verification.',
    troubleshootingScenarios: [
      {
        errorCode: 'AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application',
        description: 'Redirect URI in request does not match any URI in Azure App registrations.',
        probableCauses: ['Platform type mismatch (Web vs SPA) or missing port.'],
        resolution: 'Go to portal.azure.com > Entra ID > App registrations > Authentication > Add URI under Web platform.',
      },
    ],
    humanActions: [
      'Log in to https://portal.azure.com and open Microsoft Entra ID > App registrations.',
      'Click "New registration", select Multitenant, and add http://localhost:3000/api/auth/callback/microsoft as Web redirect.',
      'Under Certificates & secrets, generate a "New client secret" and copy Value immediately into .env.',
    ],
    nextStep: 'Register app in Microsoft Entra ID and test authorization code grant on localhost:3000.',
  },
};

const ALIASES: Record<string, string> = {
  jira: 'atlassian',
  confluence: 'atlassian',
  azure: 'microsoft',
  entra: 'microsoft',
  x: 'twitter',
};

export function getProviderProfile(nameOrDomain: string): DeveloperConsoleProfile | null {
  const cleanKey = nameOrDomain.toLowerCase().replace(/[^a-z0-9]/g, '');
  const targetKey = ALIASES[cleanKey] || cleanKey;

  for (const [key, profile] of Object.entries(PROVIDER_PROFILES)) {
    if (
      targetKey.includes(key) ||
      key.includes(targetKey) ||
      profile.name.toLowerCase().includes(nameOrDomain.toLowerCase()) ||
      profile.domain.toLowerCase().includes(nameOrDomain.toLowerCase())
    ) {
      return profile;
    }
  }
  return null;
}

