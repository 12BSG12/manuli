const directoryPath = "/manuals";
const pageList = document.getElementById("page-list");
const input = document.querySelector(".input");

input.addEventListener("input", (e) => {
  if (!e.target.value) {
    pageList.innerHTML = "";
    readDirectory(directoryPath);
  }

  const listItems = pageList.querySelectorAll("li");
  const filteredItems = [...listItems].filter((item) =>
    item.textContent.includes(e.target.value)
  );

  const html = filteredItems.map((item) => item.outerHTML).join("");

  pageList.innerHTML = html;
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
          <li class="cardItem">
            <a href="${entry}" target="_blank"><span>${fileName}</span></a>
          </li>
        `;
      } else {
        readDirectory(entry);
      }
    });
};

readDirectory(directoryPath);
