const directoryPath = "/manuals";
const pageList = document.getElementById("page-list");
const input = document.querySelector(".input");

input.addEventListener("input", (e) => {
  const filterValue = e.target.value.toLowerCase();

  [...pageList.children].forEach(item => {
    if (item.textContent.toLowerCase().includes(filterValue)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});

const readDirectory = async (directoryPath) => {
  const response = await fetch(directoryPath);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const entries = [...doc.querySelectorAll("a")].map((a) => a.href);

  entries
    .filter((item) => item.includes(`${directoryPath}/`))
    .map((entry) => {
      if (entry.endsWith(".html")) {
        const fileName = entry.split("/").pop().replace(".html", "");

        pageList.innerHTML += `
          <div class="cartItem">
            <a href="${entry}" target="_blank">
              <img src="https://via.placeholder.com/500x120" />
              <p class="subTitle">
                ${fileName}
              </p>
            </a>
          </div>
        `;
      } else {
        readDirectory(entry);
      }
    });
};

readDirectory(directoryPath);
