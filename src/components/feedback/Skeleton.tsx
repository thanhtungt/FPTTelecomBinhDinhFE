interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

export const Skeleton = ({ width = '100%', height = '1rem', radius = '12px', className }: SkeletonProps) => (
  <div className={`skeleton ${className ?? ''}`.trim()} style={{ width, height, borderRadius: radius }} />
);

export const PackageCardSkeleton = () => (
  <div className="package-card skeleton-card">
    <Skeleton width="50%" height="0.9rem" />
    <Skeleton width="80%" height="1.6rem" />
    <Skeleton width="60%" height="1.4rem" />
    <Skeleton width="100%" height="0.8rem" />
    <Skeleton width="85%" height="0.8rem" />
    <Skeleton width="70%" height="0.8rem" />
    <Skeleton width="40%" height="2.4rem" radius="999px" />
  </div>
);

export const PostCardSkeleton = () => (
  <div className="post-card skeleton-card">
    <Skeleton width="30%" height="0.8rem" />
    <Skeleton width="90%" height="1.4rem" />
    <Skeleton width="50%" height="0.8rem" />
    <Skeleton width="100%" height="0.8rem" />
    <Skeleton width="100%" height="0.8rem" />
    <Skeleton width="45%" height="1.8rem" radius="999px" />
  </div>
);

export const PostDetailSkeleton = () => (
  <article className="post-detail__article skeleton-card">
    <Skeleton width="30%" height="0.8rem" />
    <Skeleton width="85%" height="2rem" />
    <Skeleton width="40%" height="0.8rem" />
    <Skeleton width="100%" height="220px" radius="18px" />
    {Array.from({ length: 5 }).map((_, idx) => (
      <Skeleton key={idx} width="100%" height="0.9rem" />
    ))}
  </article>
);

export const RegistrationTableSkeleton = () => (
  <div className="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Contact</th>
          <th>Package</th>
          <th>Status</th>
          <th>Staff</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 4 }).map((_, idx) => (
          <tr key={idx}>
            {Array.from({ length: 7 }).map((__, colIdx) => (
              <td key={colIdx}>
                <Skeleton width="90%" height="1rem" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const PostTableSkeleton = () => (
  <div className="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Published</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, idx) => (
          <tr key={idx}>
            <td>
              <Skeleton width="80%" height="1rem" />
            </td>
            <td>
              <Skeleton width="60%" height="1rem" />
            </td>
            <td>
              <Skeleton width="50%" height="1rem" />
            </td>
            <td>
              <Skeleton width="70%" height="1rem" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
