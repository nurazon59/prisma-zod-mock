# Prisma Zod Mock

An integrated library that automatically generates Zod validation schemas and mock data factories from Prisma schemas.

## Features

- 🚀 Automatically generate Zod schemas from Prisma schemas
- 🎯 Type-safe mock data factory generation
- 🧠 Realistic data generation through semantic inference from field names
- 🔗 Consistent data generation considering relations
- ⚡ zod-prisma-types compatible options

## Installation

```bash
npm install --save-dev prisma-zod-mock
# or
yarn add -D prisma-zod-mock
# or
pnpm add -D prisma-zod-mock
```

## Usage

### 1. Add Configuration to Prisma Schema

```prisma
generator zodMock {
  provider                = "prisma-zod-mock"
  output                 = "./generated"

  // Optional settings
  createZodSchemas       = true
  createMockFactories    = true
  useMultipleFiles       = false
  mockDataLocale        = "en"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}
```

### 2. Run Generation

```bash
npx prisma generate
```

### 3. Use Generated Code

```typescript
import { createUserMock, UserSchema } from './generated';

// Generate single mock data
const user = createUserMock();
console.log(user);
// {
//   id: 'clh3k4n5j0000qw8w5h3k4n5j',
//   email: 'test@example.com',
//   name: 'John Doe',
//   createdAt: 2024-01-01T00:00:00.000Z
// }

// Customized mock data
const customUser = createUserMock({
  name: 'Alice Smith',
  email: 'alice@example.com',
});

// Validation with Zod schema
const validatedUser = UserSchema.parse(customUser);

// Batch generation
const users = createUserMockBatch(10);
```

## Configuration Options

| Option                | Default | Description                                    |
| --------------------- | ------- | ---------------------------------------------- |
| `createZodSchemas`    | `true`  | Whether to generate Zod schemas                |
| `createMockFactories` | `true`  | Whether to generate mock factories             |
| `useMultipleFiles`    | `false` | Whether to split output into multiple files    |
| `writeBarrelFiles`    | `true`  | Whether to generate barrel files (index.ts)    |
| `mockDataLocale`      | `"en"`  | Faker.js locale setting                        |
| `mockDateRange`       | `30`    | Date generation range (in days)                |
| `createRelationMocks` | `true`  | Whether to generate mocks with relations       |

## Field-Level Annotations

You can customize mock generation logic for each field using `@mock` annotations.

### Value Generation Priority

prisma-zod-mock generates values based on the following priority:

1. **@mock annotation** - Highest priority
2. **Prisma default values** - `@default("USER")`, `@default(true)`, etc.
3. **Semantic inference** - Automatically determined from field names

### Basic Usage

```prisma
model User {
  // Direct Faker method specification
  email     String   @unique /// @mock faker.internet.email()
  name      String?  /// @mock faker.person.fullName()

  // Fixed values
  role      String   @default("USER") /// @mock "USER"
  isActive  Boolean  /// @mock true

  // Numeric range specification
  age       Int?     /// @mock.range(18, 100)
  score     Float    /// @mock.range(0.0, 100.0)

  // Regular expression pattern
  code      String   /// @mock.pattern("[A-Z]{3}-[0-9]{4}")
  phone     String?  /// @mock.pattern("[0-9]{3}-[0-9]{4}-[0-9]{4}")

  // Random selection from choices
  country   String   /// @mock.enum("Japan", "USA", "UK", "France")
  status    String   /// @mock.enum("active", "inactive", "pending")
}
```

### Using Default Values

When Prisma's `@default` attribute is set, the mock uses the same value:

```prisma
model Settings {
  // @default values are used in mocks
  emailNotifications  Boolean  @default(true)   // Mock: true
  theme              String   @default("light") // Mock: 'light'
  maxRetries         Int      @default(3)       // Mock: 3

  // @mock annotation takes precedence when present
  language           String   @default("en") /// @mock "ja"  // Mock: "ja"
}
```

## Semantic Inference

Automatically infers data types from field names:

- `email`, `mail` → Email address
- `name`, `firstName`, `lastName` → Person names
- `phone`, `tel`, `mobile` → Phone numbers
- `address`, `street`, `city`, `zip` → Addresses
- `url`, `website`, `link` → URLs
- `description`, `bio`, `about` → Descriptions
- `title`, `heading`, `subject` → Titles
- `date`, `createdAt`, `updatedAt` → Dates
- `image`, `avatar`, `photo` → Image URLs
- `price`, `cost`, `amount` → Prices
- `country` → Country names
- `company`, `organization` → Company names

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Development mode
pnpm dev
```

## License

MIT