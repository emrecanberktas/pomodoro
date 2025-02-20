export const fetchTasks = async (): Promise<any> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token bulunamadı! Lütfen giriş yapın.");
  }

  const response = await fetch("http://localhost:8080/api/pomodoro/tasks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Veri alınamadı!");
  }

  return response.json();
};
