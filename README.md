# PostPilot Enterprise Backend Engine

[![NestJS](https://img.shields.io/badge/Framework-NestJS-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![GraphQL](https://img.shields.io/badge/API-GraphQL-E10098?style=for-the-badge&logo=graphql)](https://graphql.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-626CD9?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Facebook](https://img.shields.io/badge/Integration-Facebook-1877F2?style=for-the-badge&logo=facebook)](https://developers.facebook.com/)

## Executive Summary

PostPilot is a professional-grade backend infrastructure engineered for automated social media orchestration and enterprise management. Developed with a focus on reliability and scalability, the system provides a robust foundation for multi-platform publishing, sophisticated role-based access control (RBAC), and automated financial billing operations.

The engine is architected to streamline complex digital marketing workflows, ensuring that businesses can manage their multi-platform presence through a unified, secure, and performant API.

---

## Technical Ecosystem

The PostPilot backend is built upon a modern, high-performance technology stack designed for enterprise scalability and type-safety.

### Core Framework and Language
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript**: The primary programming language, ensuring strict type-safety across the entire codebase.
- **Fastify/Express**: Underlying high-performance HTTP server engines.

### API and Communication Layer
- **GraphQL**: Core API technology providing a flexible and efficient data query language.
- **Mercurius**: A high-performance GraphQL adapter for Fastify, optimized for low-latency interactions.
- **Nodemailer**: Enterprise-grade email delivery system for transactional and notification workflows.

### Data Management and Persistence
- **Prisma ORM**: A next-generation Node.js and TypeScript ORM for intuitive and type-safe database access.
- **Relational Databases**: Support for PostgreSQL and MongoDB through Prisma's unified abstraction layer.

### Security and Identity Architecture
- **Passport.js**: Comprehensive authentication middleware supporting multiple strategies.
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism for secure and scalable session management.
- **Bcrypt**: Industry-standard library for secure password hashing and protection.

### External Integrations and Utilities
- **Stripe**: Full-stack integration for subscription management, billing, and global payment processing.
- **Facebook Business SDK**: Official integration for automated publishing and engagement analytics on Meta platforms.
- **Google Gemini / OpenAI**: Advanced AI integration for supplemental content synthesis and assistance.
- **Sharp**: High-performance image processing library for asset optimization and transformation.

---

## Core Technical Pillars

### 1. Unified Social Media Orchestration
The primary function of the PostPilot engine is to manage high-volume interactions across multiple social media platforms through official enterprise SDKs:
- **Enterprise OAuth Management**: Secure orchestration of authentication flows and long-lived session tokens.
- **Automated Publishing Pipelines**: High-performance processing and delivery of media assets (images/videos) optimized for platform-specific specifications.
- **Engagement Analytics Synchronization**: Automated background workers for retrieving and normalizing metrics (reach, impressions, and engagement) into a unified internal dashboard.

### 2. Multi-Tenant Identity and Access Management (IAM)
A sophisticated security architecture designed for business scalability:
- **Granular Permission Nodes**: Fine-grained access control (e.g., `APPROVE_POST`, `MANAGE_PLANS`) mapped to dynamically configurable roles.
- **Invitation Orchestration**: Secure team onboarding via signed cryptographic tokens and expiration logic.
- **Strict Data Isolation**: Multi-tenant partitioning ensuring absolute data privacy between different business entities within the shared infrastructure.

### 3. Financial Systems and Billing Lifecycle
End-to-end integration with the Stripe ecosystem for comprehensive SaaS management:
- **Feature-Tier Enforcement**: Automated entitlement management based on active subscription status.
- **Lifecycle Webhook Handling**: Real-time synchronization of billing states (renewals, failures, and cancellations) from the payment provider to the internal database.
- **Secure Checkout Integration**: Managed orchestration of payment sessions for high-security transaction processing.

### 4. Supplemental Content Assistance
The engine includes a supplemental intelligence layer that utilizes third-party AI APIs to assist users in content creation:
- **Caption Synthesis**: Automated generation of platform-appropriate copy based on business-specific metadata.
- **Preference Persistence**: User-level configuration of content parameters (tone, length, and formatting) for consistent content generation.

---

## System Architecture

The project utilizes a **Modular NestJS Architecture** to ensure high maintainability and codebase stability.

```text
src/
├── modules/
│   ├── social-accounts/ # Core platform integrations & OAuth
│   ├── posts/         # Central logic for publishing workflows
│   ├── roles/         # Dynamic RBAC engine
│   ├── stripe/        # Billing & Subscription systems
│   ├── auth/          # Identity security & Strategy orchestration
│   ├── businesses/    # Multi-tenant profile management
│   └── ai/            # Content assistance service
├── common/            # Shared decorators and interceptors
└── prisma/            # Database schema and type-safe client
```

---

## GraphQL API Specification

The infrastructure exposes a type-safe GraphQL endpoint via **Mercurius**.

### Major Operational Nodes
- `createPost`: Orchestrates the publishing lifecycle, from media attachment to scheduling.
- `submitPostForApproval`: Transitions content through the internal multi-user review pipeline.
- `businessAnalytics`: Synchronizes and retrieves aggregated performance data from all connected platforms.
- `createCheckoutSession`: Generates secure portals for transaction and subscription management.

---

## Security Framework
- **Authentication**: Stateless JWT-based authentication with strict token validation.
- **Authorization**: Resolver-level guards enforcing RBAC and cross-tenant data isolation.
- **Reliable Validation**: Comprehensive input validation using `class-validator` and GraphQL type-guards.

---

## License
Proprietary and confidential. Internal use only. Unauthorized distribution is prohibited.
