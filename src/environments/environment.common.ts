import { GlobalConfig } from '../config/global-config.interface';
import { NotificationAnimationsType } from '../app/shared/notifications/models/notification-animations-type';
import { BrowseByType } from '../app/+browse-by/+browse-by-switcher/browse-by-decorator';
import { RestRequestMethod } from '../app/core/data/rest-request-method';

export const environment: GlobalConfig = {
  production: true,
  // Angular Universal server settings.
  // NOTE: these must be "synced" with the 'dspace.ui.url' setting in your backend's local.cfg.
  ui: {
    ssl: false,
    host: 'localhost',
    port: 4000,
    // NOTE: Space is capitalized because 'namespace' is a reserved string in TypeScript
    nameSpace: '/',
  },
  // The REST API server settings.
  // NOTE: these must be "synced" with the 'dspace.server.url' setting in your backend's local.cfg.
  // The 'nameSpace' must always end in "/api" as that's the subpath of the REST API in the backend.
  rest: {
    ssl: true,
    host: 'dspacecris7.4science.cloud',
    port: 443,
    // NOTE: Space is capitalized because 'namespace' is a reserved string in TypeScript
    nameSpace: '/server/api',
  },
  // Caching settings
  cache: {
    // NOTE: how long should objects be cached for by default
    msToLive: {
      default: 15 * 60 * 1000, // 15 minutes
    },
    // msToLive: 1000, // 15 minutes
    control: 'max-age=60', // revalidate browser
    autoSync: {
      defaultTime: 0,
      maxBufferSize: 100,
      timePerMethod: {[RestRequestMethod.PATCH]: 3} as any // time in seconds
    }
  },
  // Form settings
  form: {
    // NOTE: Map server-side validators to comparative Angular form validators
    validatorMap: {
      required: 'required',
      regex: 'pattern'
    }
  },
  // Notifications
  notifications: {
    rtl: false,
    position: ['top', 'right'],
    maxStack: 8,
    // NOTE: after how many seconds notification is closed automatically. If set to zero notifications are not closed automatically
    timeOut: 5000, // 5 second
    clickToClose: true,
    // NOTE: 'fade' | 'fromTop' | 'fromRight' | 'fromBottom' | 'fromLeft' | 'rotate' | 'scale'
    animate: NotificationAnimationsType.Scale
  },
  // Submission settings
  submission: {
    autosave: {
      // NOTE: which metadata trigger an autosave
      metadata: ['dc.title', 'dc.identifier.doi', 'dc.identifier.pmid', 'dc.identifier.arxiv'],
      // NOTE: every how many minutes submission is saved automatically
      timer: 5
    },
    icons: {
      metadata: [
        /**
         * NOTE: example of configuration
         * {
         *    // NOTE: metadata name
         *    name: 'dc.author',
         *    // NOTE: fontawesome (v5.x) icon classes and bootstrap utility classes can be used
         *    style: 'fa-user'
         * }
         */
        {
          name: 'dc.author',
          style: 'fas fa-user'
        },
        {
          name: 'dc.contributor.author',
          style: 'fas fa-user'
        },
        {
          name: 'local.contributor.affiliation',
          style: 'fas fa-university'
        },
        // default configuration
        {
          name: 'default',
          style: ''
        }
      ],
      authority: {
        confidence: [
          /**
           * NOTE: example of configuration
           * {
           *    // NOTE: confidence value
           *    value: 'dc.author',
           *    // NOTE: fontawesome (v4.x) icon classes and bootstrap utility classes can be used
           *    style: 'fa-user'
           * }
           */
          {
            value: 600,
            style: 'text-success'
          },
          {
            value: 500,
            style: 'text-info'
          },
          {
            value: 400,
            style: 'text-warning'
          },
          // default configuration
          {
            value: 'default',
            style: 'text-muted'
          },

        ]
      }
    },
    detectDuplicate: {
      // NOTE: list of additional item metadata to show for duplicate match presentation list
      metadataDetailsList: [
        { label: 'Document type', name: 'dc.type' }
      ]
    }
  },
  // Angular Universal settings
  universal: {
    preboot: true,
    async: true,
    time: false
  },
  // Google Analytics tracking id
  gaTrackingId: '',
  // Log directory
  logDirectory: '.',
  // NOTE: will log all redux actions and transfers in console
  debug: false,
  // Default Language in which the UI will be rendered if the user's browser language is not an active language
  defaultLanguage: 'en',
  // Languages. DSpace Angular holds a message catalog for each of the following languages.
  // When set to active, users will be able to switch to the use of this language in the user interface.
  languages: [{
    code: 'en',
    label: 'English',
    active: true,
  }, {
    code: 'es',
    label: 'Spanish',
    active: true,
  }, {
    code: 'de',
    label: 'Deutsch',
    active: false,
  }, {
    code: 'cs',
    label: 'Čeština',
    active: false,
  }, {
    code: 'nl',
    label: 'Nederlands',
    active: false,
  }, {
    code: 'pt',
    label: 'Português',
    active: false,
  }, {
    code: 'fr',
    label: 'Français',
    active: false,
  }, {
    code: 'lv',
    label: 'Latviešu',
    active: false,
  },{
    code: 'fi',
    label: 'Suomi',
    active: false,
  }],
  // Browse-By Pages
  browseBy: {
    // Amount of years to display using jumps of one year (current year - oneYearLimit)
    oneYearLimit: 10,
    // Limit for years to display using jumps of five years (current year - fiveYearLimit)
    fiveYearLimit: 30,
    // The absolute lowest year to display in the dropdown (only used when no lowest date can be found for all items)
    defaultLowerLimit: 1900,
    // List of all the active Browse-By types
    // Adding a type will activate their Browse-By page and add them to the global navigation menu,
    // as well as community and collection pages
    // Allowed fields and their purpose:
    //    id:             The browse id to use for fetching info from the rest api
    //    type:           The type of Browse-By page to display
    //    metadataField:  The metadata-field used to create starts-with options (only necessary when the type is set to 'date')
    types: [
      {
        id: 'title',
        type: BrowseByType.Title,
      },
      {
        id: 'dateissued',
        type: BrowseByType.Date,
        metadataField: 'dc.date.issued'
      },
      {
        id: 'author',
        type: BrowseByType.Metadata
      },
      {
        id: 'subject',
        type: BrowseByType.Metadata
      },
      {
        id: 'rodept',
        type: BrowseByType.Metadata
      },
      {
        id: 'type',
        type: BrowseByType.Metadata
      },
      {
        id: 'rpname',
        type: BrowseByType.Title
      },
      {
        id: 'rpdept',
        type: BrowseByType.Metadata
      },
      {
        id: 'ouname',
        type: BrowseByType.Title
      },
      {
        id: 'pjtitle',
        type: BrowseByType.Title
      },
      {
        id: 'eqtitle',
        type: BrowseByType.Title
      },
      {
        id: 'rotitle',
        type: BrowseByType.Title
      },
      {
        id: 'rodateissued',
        type: BrowseByType.Date,
        metadataField: 'dc.date.issued'
      },
      {
        id: 'rodatecreated',
        type: BrowseByType.Date,
      },
      {
        id: 'rodatemodified',
        type: BrowseByType.Date,
      },
      {
        id: 'rpdatecreated',
        type: BrowseByType.Date,
      },
      {
        id: 'rpdatemodified',
        type: BrowseByType.Date,
      },
      {
        id: 'outitle',
        type: BrowseByType.Title,
      },
      {
        id: 'oudatecreated',
        type: BrowseByType.Date,
      },
      {
        id: 'oudatemodified',
        type: BrowseByType.Date,
      },
      {
        id: 'pftitle',
        type: BrowseByType.Title,
      },
      {
        id: 'pfdatecreated',
        type: BrowseByType.Date,
      },
      {
        id: 'pfdatemodified',
        type: BrowseByType.Date,
      },
      {
        id: 'pfdatestart',
        type: BrowseByType.Date,
      },
      {
        id: 'pfdateend',
        type: BrowseByType.Date,
      },
      {
        id: 'eqdatecreated',
        type: BrowseByType.Date,
      },
      {
        id: 'eqdatemodified',
        type: BrowseByType.Date,
      }
    ]
  },
  item: {
    edit: {
      undoTimeout: 10000 // 10 seconds
    }
  },
  collection: {
    edit: {
      undoTimeout: 10000 // 10 seconds
    }
  },
  theme: {
    name: 'default',
  },
  layout: {
    urn: [
      {
        name: 'doi',
        baseUrl: 'https://doi.org/'
      },
      {
        name: 'hdl',
        baseUrl: 'https://hdl.handle.net/'
      },
      {
        name: 'mailto',
        baseUrl: 'mailto:'
      }
    ],
    crisRef: [
      {
        entityType: 'DEFAULT',
        icon: 'fa fa-info'
      },
      {
        entityType: 'PERSON',
        icon: 'fa fa-user'
      },
      {
        entityType: 'ORGUNIT',
        icon: 'fa fa-university'
      }
    ]
  }
};
