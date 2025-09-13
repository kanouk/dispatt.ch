const Health = () => {
  const healthData = {
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "dispatt-admin",
    version: "1.0.0"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl mb-4">Health Check</h2>
          <div className="bg-base-300 rounded-lg p-4">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
          <div className="mt-4 text-center">
            <div className="badge badge-success">Status: OK</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;