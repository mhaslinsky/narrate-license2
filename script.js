btnSubmit = document.getElementById("enter");
const licenseDisplay = document.querySelector(".lic-display");
const licenseNumber = document.getElementById("licDisplayNum");
const userTable = document.getElementById("user-table");
const userTableBody = document
  .getElementById("user-table")
  .getElementsByTagName("tbody")[0];
let allAccountsFile = document.getElementById("allAccounts");
let activeAccountsFile = document.getElementById("activeAccount");
let fileFlags = [];

licenseDisplay.classList.add("hidden");
userTable.classList.add("hidden");

btnSubmit.addEventListener("click", async function () {
  const activeAccountsData = await processActiveAccountCSV();
  const allAccountsData = await processAccountAllCSV();
  const userObjects = await userObject(allAccountsData, activeAccountsData);

  userObjects.forEach((userObject) => {
    let tr = userTableBody.insertRow();
    let td1 = tr.insertCell();
    let td2 = tr.insertCell();
    let td3 = tr.insertCell();
    let td4 = tr.insertCell();

    td1.innerHTML = userObject.firstName;
    td2.innerHTML = userObject.lastName;
    td3.innerHTML = userObject.lastActivity;
    td4.innerHTML = userObject.Group;
  });

  licenseNumber.textContent = `Licenses in Use: ${userObjects.length}`;
  licenseDisplay.classList.remove("hidden");
  userTable.classList.remove("hidden");
  btnSubmit.classList.remove("bouncy");
});

allAccountsFile.addEventListener("change", function () {
  fileFlags[0] = true;
  enableButtonAnim();
});

activeAccountsFile.addEventListener("change", function () {
  fileFlags[1] = true;
  enableButtonAnim();
});

function enableButtonAnim() {
  if (fileFlags[0] && fileFlags[1]) {
    btnSubmit.classList.add("bouncy");
  }
}

const defaultConfig = {
  delimiter: ",",
  newline: "", // auto-detect
  quoteChar: '"',
  header: true,
  worker: true,
  skipEmptyLines: true,
  error: undefined,
};

async function parseCsv(file, config) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      ...config,
      complete: (results) => {
        return resolve(results);
      },
      error: (error) => {
        return reject(error);
      },
    });
  });
}

async function processAccountAllCSV() {
  //holds license data
  const allAccountsCsvFile = document.getElementById("allAccounts").files[0];
  const parsedCsv = await parseCsv(allAccountsCsvFile, defaultConfig);

  return parsedCsv.data;
}

async function processActiveAccountCSV() {
  //holds data on when account last used
  const activeAccountsCsvFile =
    document.getElementById("activeAccount").files[0];
  const parsedCsv = await parseCsv(activeAccountsCsvFile, defaultConfig);

  return parsedCsv.data;
}

async function userObject(allAccountsData, activeAccountsData) {
  console.log(allAccountsData);
  const nonLicensedUsers = allAccountsData.filter((user) => {
    const adminAccess = user.Access.includes("Admin");
    const readOnlyAccess = user.Access.includes("Read-only");
    const isEnabled = user.Enabled === "TRUE";

    return isEnabled && !adminAccess && !readOnlyAccess;
  });

  console.log(nonLicensedUsers);

  const createUserObjects = nonLicensedUsers.map((user) => {
    const firstName = user["First name"];
    const lastName = user["Last name"];
    const userName = user["User name"];
    const Group = user["Group"];

    const activeAccountMatch = activeAccountsData.find((activeAccount) => {
      return activeAccount["Account"].includes(userName);
    });

    return {
      firstName,
      lastName,
      lastActivity:
        activeAccountMatch && activeAccountMatch["Last Activity Timestamp"],
      Group,
    };
  });

  return createUserObjects;
}
