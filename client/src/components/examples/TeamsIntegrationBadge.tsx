import TeamsIntegrationBadge from '../TeamsIntegrationBadge';

export default function TeamsIntegrationBadgeExample() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <TeamsIntegrationBadge connected={false} />
      <TeamsIntegrationBadge connected={true} />
      <TeamsIntegrationBadge connected={true} screenSharing={true} />
    </div>
  );
}
