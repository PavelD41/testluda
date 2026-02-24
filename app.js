(() => {
  const splashScreen = document.getElementById("splash-screen");
  const mainLayout = document.getElementById("main-layout");
  const wheelCanvas = document.getElementById("wheel-canvas");
  const wheelStatus = document.getElementById("wheel-status");
  const startGameBtn = document.getElementById("start-game-btn");
  const betsListEl = document.getElementById("bets-list");
  const playersCountEl = document.getElementById("players-count");
  const totalBankEl = document.getElementById("total-bank");
  const betForm = document.getElementById("bet-form");
  const nicknameInput = document.getElementById("nickname-input");
  const amountInput = document.getElementById("amount-input");
  const amountSuffix = document.getElementById("amount-suffix");
  const bottomNavItems = Array.from(
    document.querySelectorAll(".bottom-nav-item")
  );
  const pages = Array.from(document.querySelectorAll(".page"));
  const profileNameEls = Array.from(
    document.querySelectorAll("[data-profile-name]")
  );
  const profileUsernameEls = Array.from(
    document.querySelectorAll("[data-profile-username]")
  );
  const balanceValueEl = document.getElementById("balance-value");
  const topupBtn = document.getElementById("topup-btn");
  const participantsListEl = document.getElementById("participants-list");
  const hashValueEl = document.getElementById("hash-value");
  const segmentsButtons = Array.from(
    document.querySelectorAll(".segment[data-bet-type]")
  );

  const ctx = wheelCanvas.getContext("2d");
  const size = wheelCanvas.width;
  const center = size / 2;
  const innerRadius = 40;
  const outerRadius = size / 2 - 6;

  let currentRotation = 0;
  let bets = [];
  let gameId = 360893;
  let isSpinning = false;
  let currentBetType = "TON";
  let tg;
  let userBalance = 0.07;

  function randomPastel(index) {
    const palette = [
      "#ffd66b",
      "#5fd2ff",
      "#a673ff",
      "#ff8bb0",
      "#7fffba",
      "#ffb36a",
      "#7ea6ff",
    ];
    return palette[index % palette.length];
  }

  function generateHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 16; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  function updateParticipantsList() {
    participantsListEl.innerHTML = '';
    
    if (!bets.length) {
      const empty = document.createElement('div');
      empty.className = 'participants-empty';
      empty.textContent = 'Нет участников';
      participantsListEl.appendChild(empty);
      return;
    }

    const total = bets.reduce((sum, b) => sum + b.amount, 0) || 1;
    
    bets.forEach((bet, index) => {
      const participant = document.createElement('div');
      participant.className = 'participant-item';
      
      const name = document.createElement('div');
      name.className = 'participant-name';
      name.textContent = bet.nickname;
      
      const percentage = document.createElement('div');
      percentage.className = 'participant-percentage';
      const chancePercent = (bet.amount / total) * 100;
      percentage.textContent = `${chancePercent.toFixed(2)}%`;
      
      const amount = document.createElement('div');
      amount.className = 'participant-amount';
      amount.innerHTML = `<span class="currency-icon">◆</span> ${formatAmount(bet.amount)}`;
      
      participant.appendChild(name);
      participant.appendChild(percentage);
      participant.appendChild(amount);
      
      participantsListEl.appendChild(participant);
    });
  }

  function updateBalance() {
    balanceValueEl.textContent = userBalance.toFixed(2);
  }

  function showTopupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>Пополнение баланса</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label class="field-label">Сумма пополнения</label>
            <div class="field-with-addon">
              <input type="number" id="topup-amount" class="field-input" placeholder="1.00" min="0.01" step="0.01">
              <span class="field-addon">TON</span>
            </div>
          </div>
          <div class="topup-options">
            <button class="topup-preset" data-amount="1">+1 TON</button>
            <button class="topup-preset" data-amount="5">+5 TON</button>
            <button class="topup-preset" data-amount="10">+10 TON</button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary wide" id="confirm-topup">Пополнить</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.modal-close');
    const confirmBtn = modal.querySelector('#confirm-topup');
    const amountInput = modal.querySelector('#topup-amount');
    const presetBtns = modal.querySelectorAll('.topup-preset');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        amountInput.value = btn.dataset.amount;
      });
    });
    
    confirmBtn.addEventListener('click', () => {
      const amount = parseFloat(amountInput.value);
      if (amount && amount > 0) {
        userBalance += amount;
        updateBalance();
        document.body.removeChild(modal);
      }
    });
  }

  function updateAmountSuffix() {
    const map = {
      TON: "TON",
      STAR: "★",
      GIFT: "🎁",
    };
    amountSuffix.textContent = map[currentBetType] || "TON";
  }

  function updateSummary() {
    playersCountEl.textContent = bets.length.toString();
    const total = bets.reduce((sum, b) => sum + b.amount, 0);
    totalBankEl.textContent = total.toFixed(2);

    updateParticipantsList();
    hashValueEl.textContent = generateHash();

    if (bets.length >= 2 && total > 0 && !isSpinning) {
      startGameBtn.disabled = false;
      wheelStatus.textContent = "Готово к запуску PvP";
    } else if (!isSpinning) {
      startGameBtn.disabled = true;
      wheelStatus.textContent = "Ожидание игроков";
    }
  }

  function renderBetsList() {
    betsListEl.innerHTML = "";
    if (!bets.length) {
      betsListEl.classList.add("empty");
      const empty = document.createElement("div");
      empty.className = "bets-empty";
      empty.innerHTML = "Пока нет ставок.<span>Стань первым игроком!</span>";
      betsListEl.appendChild(empty);
      return;
    }
    betsListEl.classList.remove("empty");

    const total = bets.reduce((sum, b) => sum + b.amount, 0) || 1;

    bets.forEach((bet, index) => {
      const item = document.createElement("div");
      item.className = "bet-item";

      const avatar = document.createElement("div");
      avatar.className = "bet-avatar";
      avatar.style.backgroundImage = `radial-gradient(circle at 30% 20%, ${randomPastel(
        index
      )}, #1e1142)`;

      const main = document.createElement("div");
      main.className = "bet-main";

      const name = document.createElement("div");
      name.className = "bet-name";
      name.textContent = bet.nickname;

      const tagline = document.createElement("div");
      tagline.className = "bet-tagline";
      tagline.textContent = "Игрок";

      main.appendChild(name);
      main.appendChild(tagline);

      const right = document.createElement("div");
      right.className = "bet-right";

      const amount = document.createElement("div");
      amount.className = "bet-amount";
      amount.innerHTML = `<span class="currency-icon">◆</span> ${formatAmount(
        bet.amount
      )}`;

      const chance = document.createElement("div");
      chance.className = "bet-chance";
      const chancePercent = (bet.amount / total) * 100;
      chance.textContent = `${chancePercent.toFixed(2)}%`;

      const type = document.createElement("div");
      type.className = "bet-type";
      type.textContent =
        bet.type === "TON" ? "TON" : bet.type === "STAR" ? "Звезды" : "Подарки";

      right.appendChild(amount);
      right.appendChild(chance);
      right.appendChild(type);

      item.appendChild(avatar);
      item.appendChild(main);
      item.appendChild(right);

      betsListEl.appendChild(item);
    });
  }

  function drawWheel() {
    ctx.clearRect(0, 0, size, size);

    const total = bets.reduce((sum, b) => sum + b.amount, 0);

    if (!bets.length || total <= 0) {
      ctx.save();
      ctx.translate(center, center);
      const colors = ["#5fd2ff", "#ffd66b", "#a673ff", "#ff8bb0"];
      const angleStep = (Math.PI * 2) / colors.length;
      let start = -Math.PI / 2;
      colors.forEach((color) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, outerRadius, start, start + angleStep);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(
          0,
          -outerRadius,
          0,
          outerRadius
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "#091024");
        ctx.fillStyle = gradient;
        ctx.fill();
        start += angleStep;
      });
      ctx.restore();
      return;
    }

    let startAngle = -Math.PI / 2;
    bets.forEach((bet, index) => {
      const sliceAngle = (bet.amount / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.translate(center, center);

      const baseColor = randomPastel(index);
      const gradient = ctx.createRadialGradient(
        0,
        0,
        innerRadius,
        0,
        0,
        outerRadius
      );
      gradient.addColorStop(0, "#05091c");
      gradient.addColorStop(0.3, baseColor + "cc");
      gradient.addColorStop(1, "#020417");

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();
      startAngle = endAngle;
    });
  }

  function spinWheel() {
    if (isSpinning || bets.length < 2) return;
    const total = bets.reduce((sum, b) => sum + b.amount, 0);
    if (total <= 0) return;

    isSpinning = true;
    startGameBtn.disabled = true;
    wheelStatus.textContent = "PvP начался...";

    const rand = Math.random() * total;
    let acc = 0;
    let winnerIndex = 0;
    for (let i = 0; i < bets.length; i++) {
      acc += bets[i].amount;
      if (rand <= acc) {
        winnerIndex = i;
        break;
      }
    }

    const angles = [];
    let start = 0;
    bets.forEach((bet) => {
      const sliceAngle = (bet.amount / total) * Math.PI * 2;
      angles.push({ start, end: start + sliceAngle });
      start += sliceAngle;
    });

    const winnerSegment = angles[winnerIndex];
    const midAngle =
      (winnerSegment.start + winnerSegment.end) / 2 - Math.PI / 2;

    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const targetAngle = fullSpins * 2 * Math.PI + (Math.PI / 2 - midAngle);
    const targetDeg = (currentRotation + targetAngle) * (180 / Math.PI);

    wheelCanvas.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.02, 0, 1)';
    wheelCanvas.style.transform = `rotate(${targetDeg}deg)`;

    setTimeout(() => {
      currentRotation = targetAngle % (Math.PI * 2);
      wheelStatus.textContent = `Победитель: ${bets[winnerIndex].nickname}`;
      
      userBalance += total;
      updateBalance();
      
      isSpinning = false;

      gameId += 1;
      document.getElementById("game-id").textContent = gameId.toString();

      setTimeout(() => {
        bets = [];
        renderBetsList();
        drawWheel();
        updateSummary();
        wheelCanvas.style.transition = 'transform 4s cubic-bezier(0.12, 0.02, 0, 1)';
      }, 3000);
    }, 4500);
  }

  function switchPage(targetId) {
    pages.forEach((page) => {
      page.classList.toggle("page-active", page.id === targetId);
    });
  }

  function initBottomNav() {
    bottomNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        const target = item.getAttribute("data-nav-target");
        if (!target) return;
        switchPage(target);
        bottomNavItems.forEach((btn) =>
          btn.classList.toggle("bottom-nav-item-active", btn === item)
        );
      });
    });
  }

  function initTelegram() {
    try {
      tg = window.Telegram && window.Telegram.WebApp;
    } catch (e) {
      tg = undefined;
    }
    if (!tg) return;

    tg.ready();
    if (tg.expand) {
      tg.expand();
    }

    const user = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (user) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
      const username = user.username ? `@${user.username}` : fullName || "Игрок";

      profileNameEls.forEach((el) => {
        el.textContent = fullName || username;
      });
      profileUsernameEls.forEach((el) => {
        el.textContent = username;
      });
    }

    if (tg.themeParams && tg.themeParams.bg_color) {
      document.body.style.backgroundColor = tg.themeParams.bg_color;
    }
  }

  segmentsButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) return;
      segmentsButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentBetType = btn.getAttribute("data-bet-type");
      updateAmountSuffix();
    });
  });

  betForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (isSpinning) return;

    const nickname =
      nicknameInput.value.trim() || `Игрок #${bets.length + 1}`;
    const amount = parseFloat(amountInput.value.replace(",", "."));
    if (!amount || amount <= 0) {
      amountInput.focus();
      return;
    }

    if (userBalance < amount) {
      alert('Недостаточно средств на балансе!');
      return;
    }

    userBalance -= amount;
    updateBalance();

    bets.push({
      nickname,
      amount,
      type: currentBetType,
    });

    nicknameInput.value = "";
    amountInput.value = "";

    renderBetsList();
    drawWheel();
    updateSummary();
  });

  topupBtn.addEventListener("click", () => {
    showTopupModal();
  });

  startGameBtn.addEventListener("click", () => {
    spinWheel();
  });

  drawWheel();
  updateBalance();
  updateParticipantsList();

  initBottomNav();
  initTelegram();

  window.addEventListener("load", () => {
    setTimeout(() => {
      splashScreen.classList.add("hidden");
      mainLayout.classList.remove("hidden");
    }, 1400);
  });
})();

