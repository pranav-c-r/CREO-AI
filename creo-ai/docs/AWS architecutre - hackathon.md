# **CREO AI Implementation Plan**

This plan is structured into phases for a 5-7 day build by a 4-person team (e.g., 1 frontend, 1 backend/AI, 1 DevOps/DB, 1 full-stack integrator). It assumes basic AWS familiarity and focuses on a hackathon-ready MVP: functional core features with minimal polish. We'll use Next.js API routes for backend simplicity (avoiding Lambda/API Gateway overhead for MVP). Total estimated effort: 4-6 hours/day per person, with parallel work.

Phases:

* **Phase 1: Setup & Architecture (Days 1-2)**: Infra, DB, auth.  
* **Phase 2: Core Features (Days 3-4)**: AI integration, API, frontend.  
* **Phase 3: Analytics & Polish (Days 5-6)**: Dashboard, monitoring, deployment.  
* **Phase 4: Testing & Demo (Day 7\)**: Risks, fallback, demo prep.

## **1\. High-Level Architecture Diagram (Textual Description)**

The architecture is a serverless-ish web app with Next.js as the full-stack framework, leveraging AWS for hosting, AI, DB, and auth. Here's a textual diagram using ASCII art:

\[User Browser\] \<--\> \[AWS Amplify Hosting (Next.js App)\]  
                  |  
                  | (HTTPS)  
                  v  
\[Next.js Frontend\] \<--\> \[Next.js API Routes (Backend Logic)\]  
                  |                  |  
                  | (Cognito JWT)   | (Bedrock SDK Calls)  
                  v                  v  
\[AWS Cognito\] \<--\> \[Amazon DynamoDB\] \<--\> \[Amazon Bedrock (Claude/Llama)\]  
                                    |  
                                    | (CloudWatch Metrics/Logs)  
                                    v  
\[CloudWatch\] \<--\> \[EventBridge (Scheduled Analytics Jobs)\]  
                  |  
                  v  
\[S3 (Optional Logs Storage)\]

* **Frontend**: Next.js pages/components for UI (dashboard, input forms).  
* **Backend**: Next.js API routes handle requests, call Bedrock for AI, interact with DynamoDB.  
* **Data Flow**: User authenticates via Cognito → Frontend calls API → API processes AI/DB → Returns data.  
* **Scalability**: DynamoDB auto-scales; Bedrock handles AI inference; Amplify for CI/CD.  
* **Key Interactions**: API → Bedrock for generation/scoring/optimization; API → DynamoDB for storage; EventBridge triggers periodic analytics computation (e.g., daily averages).

## **2\. Service Interaction Flow (Request Lifecycle)**

Example: User generates, optimizes, and stores content.

1. **User Login**: Browser → Cognito (via Amplify Auth) → JWT token returned.  
2. **Content Generation Request**: Frontend form submits {platform, topic, details} with JWT → Next.js API route (/api/generate).  
3. **API Processing**:  
   * Validate JWT with Cognito.  
   * Call Bedrock with generation prompt → Get raw content.  
   * Call Bedrock with scoring prompt → Get engagement score (JSON: {score: number, reasons: array}).  
   * Call Bedrock with optimization prompt → Get optimized content (hooks, CTAs, hashtags).  
4. **Storage**: API inserts into DynamoDB (posts table: userId, postId, content, score, history).  
5. **Response**: API returns {originalContent, optimizedContent, score} → Frontend displays.  
6. **Analytics Trigger**: EventBridge cron job (e.g., every 6 hours) → Lambda (simple Node.js) queries DynamoDB, computes aggregates (e.g., avg score per platform), updates analytics table.  
7. **Dashboard Fetch**: Frontend calls /api/analytics → API queries DynamoDB analytics table → Returns insights (charts via Recharts in Next.js).  
8. **Monitoring**: All API calls log to CloudWatch; errors trigger alarms.

Error Handling: Use try-catch in API; return 4xx/5xx with messages. Rate limits via Bedrock quotas.

## **3\. Detailed AWS Resource Setup Steps**

Use AWS Console for speed; script with CDK/CLI later if time.

1. **Create AWS Account/Org**: If new, enable free tier. Set up IAM admin user.  
2. **Cognito User Pool**:  
   * Go to Cognito → Create user pool.  
   * App integration: Hosted UI, domain (creoai.auth.\<region\>.amazoncognito.com).  
   * Attributes: Standard (email, name); require email verification.  
   * Policies: Password min 8 chars, MFA optional (skip for MVP).  
   * App client: Web app, enable implicit grant for JWT.  
   * Note client ID/secret.  
3. **DynamoDB Tables** (details in \#4):  
   * Create tables: posts, optimizations, analytics.  
   * Enable point-in-time recovery, auto-scaling (provisioned capacity: 5 RCU/WCU min).  
4. **Bedrock Access**:  
   * Go to Bedrock → Model access → Request access for Claude 3 Sonnet (fast/cheap) or Llama 2\.  
   * Use AWS SDK in Next.js (install @aws-sdk/client-bedrock-runtime).  
5. **Amplify Hosting**:  
   * Go to Amplify → New app → Host web app → GitHub repo (create one first).  
   * Build settings: Next.js SSR, env vars (e.g., COGNITO\_CLIENT\_ID, BEDROCK\_REGION=us-east-1).  
   * Deploy: Connect branch, build.  
6. **CloudWatch**:  
   * Default logs for Amplify/Lambda.  
   * Create dashboard: Metrics for DynamoDB (ConsumedRCU), Bedrock (Invocations).  
   * Alarm: Bedrock errors \> 5/min → Email notification.  
7. **EventBridge**:  
   * Create rule: Schedule (cron(0 0/6 \* \* ? \*)) → Target: Lambda function.  
   * Lambda: Node.js, code to query DynamoDB, compute analytics, update table.  
8. **S3 (Optional)**:  
   * Create bucket: creoai-logs-\<account-id\>.  
   * Policy: Allow CloudWatch logs put.  
9. **IAM Roles**:  
   * For Amplify: Auto-created; add Bedrock:DynamoDB full access.  
   * For Lambda: Create role with DynamoDB read/write, CloudWatch logs.

## **4\. Exact DynamoDB Schema Design**

Use single-table design for MVP efficiency (denormalize).

* **Table: creoai-posts** (Partition Key: PK, Sort Key: SK)  
  * **Keys**:  
    * PK (string): "USER\#\<userId\>" for user-owned items; "ANALYTICS\#\<platform\>" for aggregates.  
    * SK (string): "POST\#\<postId\>" for posts; "OPT\#\<postId\>\#\<version\>" for optimization history; "ANALYTICS\#\<metric\>" for insights.  
  * **Attributes** (all strings unless noted):  
    * userId (string): Cognito sub.  
    * postId (string): UUID v4.  
    * platform (string): e.g., "twitter", "linkedin".  
    * originalContent (string).  
    * optimizedContent (string).  
    * engagementScore (number): 0-100.  
    * scoreReasons (string): JSON stringified array.  
    * hooks (string): JSON array.  
    * ctas (string): JSON array.  
    * hashtags (string): JSON array.  
    * timestamp (string): ISO date.  
    * version (number): For history (1=original, 2+=optimizations).  
    * avgScore (number): For analytics items.  
    * totalPosts (number): For analytics.  
    * topReasons (string): JSON array for common reasons.  
  * **GSIs**:  
    * GSI1: PK=platform, SK=timestamp (for per-platform queries).  
    * GSI2: PK=userId, SK=platform\#timestamp (user-specific queries).  
  * **Reasoning**: Single table reduces joins/costs. PK groups by user/analytics; SK for sorting/history. Denormalize content/history for fast reads. Capacity: On-demand for hackathon (pay-per-request). TTL on timestamp \+ 30 days for old data.  
* **Example Items**:  
  * Post: {PK: "USER\#abc", SK: "POST\#123", platform: "twitter", originalContent: "...", engagementScore: 75, timestamp: "2026-02-28T11:17:00Z"}  
  * Optimization: {PK: "USER\#abc", SK: "OPT\#123\#2", optimizedContent: "...", hooks: '\["Hook1"\]'}  
  * Analytics: {PK: "ANALYTICS\#twitter", SK: "ANALYTICS\#avgScore", avgScore: 80, totalPosts: 10}

## **5\. API Endpoint Design**

Use Next.js /api routes (pages/api/\*.ts). All protected by JWT middleware.

* **/api/auth/signup**: POST {email, password} → Cognito signup → {user}.  
* **/api/auth/login**: POST {email, password} → Cognito auth → {idToken, accessToken}.  
* **/api/generate**: POST {platform: string, topic: string, details?: string} → Calls Bedrock generate → {content: string}.  
* **/api/score**: POST {content: string, platform: string} → Bedrock score → {score: number, reasons: string\[\]}.  
* **/api/optimize**: POST {content: string, platform: string} → Bedrock optimize → {optimized: string, hooks: string\[\], ctas: string\[\], hashtags: string\[\]}.  
* **/api/save-post**: POST {postData: object (from above)} → DynamoDB put → {postId: string}.  
* **/api/get-posts**: GET ?userId=string\&platform?=string → DynamoDB query → {posts: array}.  
* **/api/get-analytics**: GET ?platform?=string → DynamoDB query → {insights: {avgScore, totalPosts, topReasons}}.  
* **Request/Response**: JSON, headers: Authorization: Bearer \<JWT\>. Errors: {error: string, code: number}. Use Zod for validation.

## **6\. AI Prompt Design**

Use Claude 3 Sonnet via Bedrock. Prompts engineered for consistency.

* **Content Generation**:  
  text  
  You are a content creator for {platform}. Generate engaging content on topic: "{topic}". Details: "{details}". Keep under 280 chars for Twitter, 2000 for LinkedIn. Output only the content string.  
* **Engagement Scoring (Structured JSON)**:  
  text  
  Score this {platform} content for engagement (0-100). Factors: relevance, hook strength, CTA, virality, clarity. Output JSON: {"score": number, "reasons": \["reason1", "reason2"\]}. Content: "{content}".  
* **Optimization**:  
  text  
  Optimize this {platform} content: Add strong hook, CTA, 3-5 hashtags. Output JSON: {"optimized": string, "hooks": \["hook1"\], "ctas": \["cta1"\], "hashtags": \["\#tag1"\]}. Original: "{content}".

Invoke with Bedrock SDK: runtime.invokeModel({modelId: 'anthropic.claude-3-sonnet-20240229-v1:0', content: \[{type: 'text', text: prompt}\]}).

## **7\. Analytics Computation Logic**

Use EventBridge-triggered Lambda (Node.js with @aws-sdk/client-dynamodb).

1. Query posts: Scan or query GSI1 for PK="ANALYTICS\#\<platform\>", but actually compute from user posts.  
2. Logic:  
   * Fetch all posts per platform (query PK starts\_with "USER\#", SK="POST\#\*").  
   * Compute: avgScore \= sum(engagementScore) / count; totalPosts \= count; topReasons \= aggregate reasons (e.g., count occurrences, top 5).  
   * Update analytics items: Put {PK: "ANALYTICS\#\<platform\>", SK: "ANALYTICS\#avgScore", avgScore, ...}.  
3. Handle pagination if \>100 items. Run every 6 hours. For dashboard, query directly.

## **8\. Folder Structure for Next.js Project**

creo-ai/  
├── app/  
│   ├── api/  
│   │   ├── auth/\[...nextauth\].ts  \# Cognito integration  
│   │   ├── generate/route.ts  
│   │   ├── score/route.ts  
│   │   ├── optimize/route.ts  
│   │   ├── save-post/route.ts  
│   │   ├── get-posts/route.ts  
│   │   ├── get-analytics/route.ts  
│   ├── dashboard/page.tsx  \# Insights display  
│   ├── generate/page.tsx  \# Form for content  
│   ├── layout.tsx  
│   └── page.tsx  \# Home  
├── components/  
│   ├── AuthProvider.tsx  
│   ├── DashboardChart.tsx  \# Recharts  
│   └── ContentForm.tsx  
├── lib/  
│   ├── aws.ts  \# SDK clients (Bedrock, DynamoDB)  
│   ├── auth.ts  \# JWT validate  
│   └── prompts.ts  \# Prompt templates  
├── public/  \# Assets  
├── tailwind.config.js  
├── tsconfig.json  
├── next.config.js  \# Amplify env  
└── package.json  \# Deps: next, @aws-sdk/\*, zod, recharts

## **9\. Security Considerations**

* **IAM Roles**: Least privilege. Amplify role: bedrock:InvokeModel, dynamodb:PutItem/Query/Scan. Lambda: dynamodb:\*.  
* **Credential Handling**: Use env vars in Amplify (AWS\_ACCESS\_KEY\_ID never in code). Rotate keys post-hackathon.  
* **Auth**: Cognito JWT validation in API middleware (use jwks-rsa).  
* **Data**: Encrypt DynamoDB at rest (default). No PII beyond email.  
* **API**: Rate limit with middleware (e.g., 10/min/user). CORS headers.  
* **Bedrock**: Use temporary creds via STS.  
* **Best Practices**: Enable MFA on root/IAM. Use HTTPS everywhere.

## **10\. Cost Optimization Strategy for Hackathon Usage**

* Free Tier: Cognito (10k MAU), DynamoDB (25GB), Amplify (builds), CloudWatch (basic).  
* Bedrock: Use Claude Sonnet ($0.003/1k tokens input); limit to 100 invocations/day → \~$0.50.  
* DynamoDB: On-demand mode; \<1GB data → free.  
* EventBridge/Lambda: 1M free invocations/month.  
* Total Estimate: \<$5 for 7 days (monitor via Billing Dashboard).  
* Tips: Mock Bedrock locally with dummy responses during dev. Delete resources post-hackathon. Use us-east-1 for lowest costs.

## **11\. Deployment Flow (Dev → Test → Production)**

* **Dev**: Local (npm run dev). Git branches: feature/\*.  
* **Test**: Amplify branch "staging" → Auto-build on push. Manual tests: Postman for API, browser for UI.  
* **Production**: Amplify branch "main" → Build/deploy. Use Amplify environments: dev/test/prod with separate Cognito/DynamoDB (suffix \-dev, \-prod).  
* CI/CD: Amplify auto-deploys on PR merge. Rollback: Revert commit.  
* Post-Deploy: Seed data via API calls.

## **12\. Demo Strategy**

* **Pre-Seed**: Create 10-20 sample posts via API (mix platforms, scores 50-90). Compute analytics.  
* **Simulate**: For engagement, use fixed scores (no real posting). Demo flow: Login → Generate content → Score/Optimize → Save → View dashboard (show charts: bar for avgScore per platform, list top reasons).  
* **Script**: 5-min demo: "Input topic → AI magic → Insights". Use Amplify URL. Backup: Local run if AWS down.

## **13\. Risk Areas and Fallback Strategies**

* **Risk: Bedrock Quotas/Errors**: Fallback: Mock API responses in code (if-else).  
* **Risk: DynamoDB Throttling**: Fallback: Increase capacity manually; use local DynamoDB for dev.  
* **Risk: Auth Issues**: Fallback: Temp bypass JWT check in dev.  
* **Risk: Build Time Overruns**: Fallback: Prioritize core (generate/score/optimize) over analytics.  
* **Risk: Team Sync**: Fallback: Daily standups; use GitHub issues.  
* **Risk: Costs Overrun**: Fallback: Set budget alarm at $10.

## **14\. Clear Implementation Order (Day-by-Day Roadmap)**

* **Day 1 (Phase 1\)**: Team setup GitHub. DevOps: Set up AWS (Cognito, DynamoDB, Amplify). Backend: Implement auth API. All: Folder structure.  
* **Day 2 (Phase 1\)**: Backend: DynamoDB schema, lib/aws.ts. Integrate Bedrock SDK. Test local API calls.  
* **Day 3 (Phase 2\)**: AI/Backend: Prompts, generate/score/optimize APIs. Frontend: AuthProvider, ContentForm.  
* **Day 4 (Phase 2\)**: Backend: Save/get-posts APIs. Frontend: Generate page, integrate APIs.  
* **Day 5 (Phase 3\)**: Backend: Analytics API, EventBridge/Lambda. Frontend: Dashboard page with charts.  
* **Day 6 (Phase 3\)**: Security (IAM, middleware). Monitoring setup. Cost checks. Integration tests.  
* **Day 7 (Phase 4\)**: Deploy to staging/prod. Seed data. Demo rehearsal. Fix bugs.

Parallel: Frontend/Backend pair on features; DevOps handles infra.

## **15\. What NOT to Build to Avoid Overengineering**

* No custom domains (use Amplify default).  
* No multi-tenant isolation (single user pool).  
* No real-time updates (no WebSockets/AppSync).  
* No advanced auth (skip MFA, social logins).  
* No full CI/CD pipelines (Amplify basics only).  
* No ML training (use Bedrock out-of-box).  
* No complex UI (basic Tailwind forms/charts; no animations).  
* No external integrations (e.g., actual social posting APIs).  
* No scalability features (e.g., caching with ElastiCache).  
* No extensive testing (unit only for APIs; no e2e).

