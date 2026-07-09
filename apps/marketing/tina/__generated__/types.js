export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const PagePartsFragmentDoc = gql`
    fragment PageParts on Page {
  __typename
  title
  description
  socialImage
  blocks {
    __typename
    ... on PageBlocksHero {
      theme
      headline
      subheadlineRich
      image
      trustText
      primaryButtonText
      primaryButtonTextMobile
      primaryButtonLink
    }
    ... on PageBlocksFeatures {
      variant
      theme
      headline
      subheadline
      columns
      items {
        __typename
        title
        description
        icon
        image
        link
      }
    }
    ... on PageBlocksTestimonials {
      variant
      theme
      headline
      subheadline
      useReferences
      testimonialRefs {
        __typename
        testimonial {
          ... on Testimonial {
            __typename
            quote
            author {
              ... on Author {
                __typename
                name
                role
                avatar
                bio
                email
                social {
                  __typename
                  twitter
                  linkedin
                  github
                  website
                }
              }
              ... on Document {
                _sys {
                  filename
                  basename
                  hasReferences
                  breadcrumbs
                  path
                  relativePath
                  extension
                }
                id
              }
            }
            authorName
            authorRole
            authorAvatar
            company
            companyLogo
            rating
            featured
          }
          ... on Document {
            _sys {
              filename
              basename
              hasReferences
              breadcrumbs
              path
              relativePath
              extension
            }
            id
          }
        }
      }
      items {
        __typename
        quote
        authorName
        authorRole
        company
        avatar
        rating
      }
    }
    ... on PageBlocksCta {
      variant
      theme
      globalCtaRef {
        ... on GlobalCta {
          __typename
          name
          headline
          description
          primaryButton {
            __typename
            text
            link
            style
          }
          secondaryButton {
            __typename
            text
            link
            style
          }
          theme
        }
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
      }
      headline
      description
      image
      primaryButtonText
      primaryButtonLink
      secondaryButtonText
      secondaryButtonLink
      emailPlaceholder
      submitButtonText
    }
    ... on PageBlocksContent {
      variant
      theme
      label
      headline
      bodyText
      sidebarContent
      leftColumn
      rightColumn
    }
    ... on PageBlocksGallery {
      variant
      theme
      headline
      subheadline
      columns
      gap
      items {
        __typename
        image
        alt
        caption
        video
        aspectRatio
      }
    }
    ... on PageBlocksPricing {
      variant
      theme
      headline
      subheadline
      showToggle
      annualDiscount
      tiers {
        __typename
        name
        price
        period
        description
        features
        buttonText
        buttonLink
        highlighted
        badge
      }
    }
    ... on PageBlocksFaq {
      variant
      theme
      headline
      subheadline
      items {
        __typename
        faq {
          ... on Faq {
            __typename
            question
            answer
            category
            sortOrder
          }
          ... on Document {
            _sys {
              filename
              basename
              hasReferences
              breadcrumbs
              path
              relativePath
              extension
            }
            id
          }
        }
      }
      limit
      showCategories
      ctaText
      ctaButtonText
      ctaLink
    }
    ... on PageBlocksTeam {
      variant
      theme
      headline
      subheadline
      columns
      useReferences
      authorRefs {
        __typename
        author {
          ... on Author {
            __typename
            name
            role
            avatar
            bio
            email
            social {
              __typename
              twitter
              linkedin
              github
              website
            }
          }
          ... on Document {
            _sys {
              filename
              basename
              hasReferences
              breadcrumbs
              path
              relativePath
              extension
            }
            id
          }
        }
      }
      members {
        __typename
        name
        role
        avatar
        bio
        social {
          __typename
          twitter
          linkedin
          github
        }
      }
    }
    ... on PageBlocksStats {
      variant
      theme
      headline
      subheadline
      animate
      items {
        __typename
        value
        label
        icon
        description
        progress
      }
    }
    ... on PageBlocksLogoCloud {
      variant
      theme
      headline
      subheadline
      grayscale
      size
      logos {
        __typename
        image
        name
        url
      }
    }
    ... on PageBlocksIntakeForm {
      headline
      subheadline
      buttonText
      buttonTextMobile
      showIncludes
    }
    ... on PageBlocksBookingStepFlow {
      headline
      subheadline
    }
    ... on PageBlocksScrollReveal {
      label
      headline
    }
    ... on PageBlocksScrollFillLogo {
      slides {
        __typename
        label
        headline
      }
    }
    ... on PageBlocksStackSections {
      label
      headline
      subheadline
      items {
        __typename
        title
        body
        icon
        image
      }
    }
    ... on PageBlocksBenefitsList {
      headline
      subheadline
      items {
        __typename
        title
        body
        icon
      }
    }
    ... on PageBlocksVideoSpotlight {
      headline
      subheadline
      video
      poster
      leftImage
      rightImage
    }
    ... on PageBlocksContactForm {
      headline
      subheadline
      buttonText
    }
  }
}
    `;
export const PostPartsFragmentDoc = gql`
    fragment PostParts on Post {
  __typename
  title
  excerpt
  author {
    ... on Author {
      __typename
      name
      role
      avatar
      bio
      email
      social {
        __typename
        twitter
        linkedin
        github
        website
      }
    }
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
  }
  date
  featuredImage
  category
  tags
  featured
  body
  relatedPosts {
    __typename
    post {
      ... on Post {
        __typename
        title
        excerpt
        author {
          ... on Author {
            __typename
            name
            role
            avatar
            bio
            email
            social {
              __typename
              twitter
              linkedin
              github
              website
            }
          }
          ... on Document {
            _sys {
              filename
              basename
              hasReferences
              breadcrumbs
              path
              relativePath
              extension
            }
            id
          }
        }
        date
        featuredImage
        category
        tags
        featured
        body
        relatedPosts {
          __typename
          post {
            ... on Post {
              __typename
              title
              excerpt
              date
              featuredImage
              category
              tags
              featured
              body
              relatedPosts {
                __typename
              }
            }
            ... on Document {
              _sys {
                filename
                basename
                hasReferences
                breadcrumbs
                path
                relativePath
                extension
              }
              id
            }
          }
        }
      }
      ... on Document {
        _sys {
          filename
          basename
          hasReferences
          breadcrumbs
          path
          relativePath
          extension
        }
        id
      }
    }
  }
}
    `;
export const ProjectPartsFragmentDoc = gql`
    fragment ProjectParts on Project {
  __typename
  title
  description
  client
  date
  featuredImage
  gallery {
    __typename
    image
    alt
    caption
  }
  category
  techStack
  liveUrl
  githubUrl
  featured
  testimonial {
    ... on Testimonial {
      __typename
      quote
      author {
        ... on Author {
          __typename
          name
          role
          avatar
          bio
          email
          social {
            __typename
            twitter
            linkedin
            github
            website
          }
        }
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
      }
      authorName
      authorRole
      authorAvatar
      company
      companyLogo
      rating
      featured
    }
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
  }
  body
}
    `;
export const AuthorPartsFragmentDoc = gql`
    fragment AuthorParts on Author {
  __typename
  name
  role
  avatar
  bio
  email
  social {
    __typename
    twitter
    linkedin
    github
    website
  }
}
    `;
export const TestimonialPartsFragmentDoc = gql`
    fragment TestimonialParts on Testimonial {
  __typename
  quote
  author {
    ... on Author {
      __typename
      name
      role
      avatar
      bio
      email
      social {
        __typename
        twitter
        linkedin
        github
        website
      }
    }
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
  }
  authorName
  authorRole
  authorAvatar
  company
  companyLogo
  rating
  featured
}
    `;
export const GlobalCtaPartsFragmentDoc = gql`
    fragment GlobalCtaParts on GlobalCta {
  __typename
  name
  headline
  description
  primaryButton {
    __typename
    text
    link
    style
  }
  secondaryButton {
    __typename
    text
    link
    style
  }
  theme
}
    `;
export const SettingsPartsFragmentDoc = gql`
    fragment SettingsParts on Settings {
  __typename
  siteName
  siteDescription
  logo
  logoDark
  favicon
  socialImage
  header {
    __typename
    navigation {
      __typename
      label
      link
      children {
        __typename
        label
        link
        description
      }
    }
    ctaButton {
      __typename
      text
      link
    }
  }
  footer {
    __typename
    copyright
    columns {
      __typename
      title
      links {
        __typename
        label
        link
      }
    }
    social {
      __typename
      twitter
      facebook
      instagram
      linkedin
      github
      youtube
    }
  }
}
    `;
export const FaqPartsFragmentDoc = gql`
    fragment FaqParts on Faq {
  __typename
  question
  answer
  category
  sortOrder
}
    `;
export const PageDocument = gql`
    query page($relativePath: String!) {
  page(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PageParts
  }
}
    ${PagePartsFragmentDoc}`;
export const PageConnectionDocument = gql`
    query pageConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PageFilter) {
  pageConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PageParts
      }
    }
  }
}
    ${PagePartsFragmentDoc}`;
export const PostDocument = gql`
    query post($relativePath: String!) {
  post(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...PostParts
  }
}
    ${PostPartsFragmentDoc}`;
export const PostConnectionDocument = gql`
    query postConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: PostFilter) {
  postConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...PostParts
      }
    }
  }
}
    ${PostPartsFragmentDoc}`;
export const ProjectDocument = gql`
    query project($relativePath: String!) {
  project(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...ProjectParts
  }
}
    ${ProjectPartsFragmentDoc}`;
export const ProjectConnectionDocument = gql`
    query projectConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: ProjectFilter) {
  projectConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...ProjectParts
      }
    }
  }
}
    ${ProjectPartsFragmentDoc}`;
export const AuthorDocument = gql`
    query author($relativePath: String!) {
  author(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...AuthorParts
  }
}
    ${AuthorPartsFragmentDoc}`;
export const AuthorConnectionDocument = gql`
    query authorConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: AuthorFilter) {
  authorConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...AuthorParts
      }
    }
  }
}
    ${AuthorPartsFragmentDoc}`;
export const TestimonialDocument = gql`
    query testimonial($relativePath: String!) {
  testimonial(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...TestimonialParts
  }
}
    ${TestimonialPartsFragmentDoc}`;
export const TestimonialConnectionDocument = gql`
    query testimonialConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: TestimonialFilter) {
  testimonialConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...TestimonialParts
      }
    }
  }
}
    ${TestimonialPartsFragmentDoc}`;
export const GlobalCtaDocument = gql`
    query globalCta($relativePath: String!) {
  globalCta(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...GlobalCtaParts
  }
}
    ${GlobalCtaPartsFragmentDoc}`;
export const GlobalCtaConnectionDocument = gql`
    query globalCtaConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: GlobalCtaFilter) {
  globalCtaConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...GlobalCtaParts
      }
    }
  }
}
    ${GlobalCtaPartsFragmentDoc}`;
export const SettingsDocument = gql`
    query settings($relativePath: String!) {
  settings(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...SettingsParts
  }
}
    ${SettingsPartsFragmentDoc}`;
export const SettingsConnectionDocument = gql`
    query settingsConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: SettingsFilter) {
  settingsConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...SettingsParts
      }
    }
  }
}
    ${SettingsPartsFragmentDoc}`;
export const FaqDocument = gql`
    query faq($relativePath: String!) {
  faq(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...FaqParts
  }
}
    ${FaqPartsFragmentDoc}`;
export const FaqConnectionDocument = gql`
    query faqConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: FaqFilter) {
  faqConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...FaqParts
      }
    }
  }
}
    ${FaqPartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    page(variables, options) {
      return requester(PageDocument, variables, options);
    },
    pageConnection(variables, options) {
      return requester(PageConnectionDocument, variables, options);
    },
    post(variables, options) {
      return requester(PostDocument, variables, options);
    },
    postConnection(variables, options) {
      return requester(PostConnectionDocument, variables, options);
    },
    project(variables, options) {
      return requester(ProjectDocument, variables, options);
    },
    projectConnection(variables, options) {
      return requester(ProjectConnectionDocument, variables, options);
    },
    author(variables, options) {
      return requester(AuthorDocument, variables, options);
    },
    authorConnection(variables, options) {
      return requester(AuthorConnectionDocument, variables, options);
    },
    testimonial(variables, options) {
      return requester(TestimonialDocument, variables, options);
    },
    testimonialConnection(variables, options) {
      return requester(TestimonialConnectionDocument, variables, options);
    },
    globalCta(variables, options) {
      return requester(GlobalCtaDocument, variables, options);
    },
    globalCtaConnection(variables, options) {
      return requester(GlobalCtaConnectionDocument, variables, options);
    },
    settings(variables, options) {
      return requester(SettingsDocument, variables, options);
    },
    settingsConnection(variables, options) {
      return requester(SettingsConnectionDocument, variables, options);
    },
    faq(variables, options) {
      return requester(FaqDocument, variables, options);
    },
    faqConnection(variables, options) {
      return requester(FaqConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "http://localhost:4001/graphql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
