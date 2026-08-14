import WebsiteCreateTournamentNode from './WebsiteCreateTournamentNode';
import WebsiteCreateTournamentProperties from './WebsiteCreateTournamentProperties';
import { websiteCreateTournamentManifest } from './websiteCreateTournamentManifest';

export {
  WebsiteCreateTournamentNode,
  WebsiteCreateTournamentProperties,
  websiteCreateTournamentManifest,
};

export default {
  type: 'websiteCreateTournament',
  node: WebsiteCreateTournamentNode,
  properties: WebsiteCreateTournamentProperties,
  manifest: websiteCreateTournamentManifest,
};
