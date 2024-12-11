
let team1 = document.getElementById("team1pokemon");
let team2 = document.getElementById("team2pokemon");
const addNewPokemon = document.getElementById("getPokemon");
let numberOfPokemon = document.getElementById("pokemonNumber");
let addNewPokemonforTeam2 = document.getElementById("getPokemon2");
const begin_battle = document.getElementById("startBattle");
const firsttext = document.getElementById("first text");
let additions = document.getElementById("additions");
let infoText = document.getElementById("infoText");
let selectedTeam1Pokemon = null;
let selectedTeam2Pokemon = null;
let defeated = false;
let pokemonLimit = numberOfPokemon.value;
setInterval(() => {
    if (team2.children.length >= pokemonLimit) {
        addNewPokemonforTeam2.disabled = true;
    }
    if (team1.children.length >= pokemonLimit) {
        addNewPokemon.disabled = true;
    }
    if ((team1.children.length == pokemonLimit) && (team2.children.length != pokemonLimit)) {
        firsttext.style.display = "block";
    }
}, 1)
function applyTypeClass(card, types) {
    const primaryType = types[0]?.type.name || "default";
    card.classList.add(`type-${primaryType}`);
}

function updateCardColorForDefeat(card) {
    card.classList.remove(...Array.from(card.classList).filter(cls => cls.startsWith('type-')));
    card.classList.add('defeated');
}
async function fetchDataMovements(moveUrl) {
    const response = await fetch(moveUrl);
    const data = await response.json();
    return data;
}
async function fetchData(toAppend) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNumber()}`);
    const data = await response.json();

    for (let i = 0; i < toAppend.children.length; i++) {
        if (toAppend.children[i].id == data.id) return;
    }

    const temp = document.getElementById("template");
    const clonedTemp = temp.content.cloneNode(true);
    let card = clonedTemp.querySelector(".pokeEntry");

    // Asignar información básica
    card.setAttribute("id", data.id);
    clonedTemp.querySelector(".pokeName").textContent = data.name;
    clonedTemp.querySelector(".abilities").textContent = "Abilities: " + data.abilities.map(a => a.ability.name).join(", ");
    clonedTemp.querySelector(".type").textContent = "Type: " + data.types.map(t => t.type.name).join(", ");
    clonedTemp.querySelector(".pokemonImage").setAttribute("src", data.sprites.front_default);
    clonedTemp.querySelector(".atacks").textContent = "Attack: " + data.stats[1].base_stat;
    clonedTemp.querySelector(".defense").textContent = "Defense: " + data.stats[2].base_stat;

    assignInitialHP(card);

    // Colorear por tipo
    applyTypeClass(card, data.types);

    // Añadir movimientos con lógica de combate
    const attackerAttack = data.stats[1].base_stat;
    const defenderCard = toAppend === team1 ? team2 : team1; // Equipo contrario
    await addMovesToCard(card, data.moves, attackerAttack, defenderCard);

    toAppend.appendChild(card);
    additions.innerHTML += `The Pokémon ${data.name} has been added to the team!<br>`;
}

function randomNumber() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}
function selectRandomMoves(maximum) {
    return Math.floor(Math.random() * (maximum - 1 + 1)) + 1;
}
addNewPokemon.addEventListener("click", () => {
    for (let i = 0; i < numberOfPokemon.value; i++) {
        fetchData(team1);
    }
});


addNewPokemonforTeam2.addEventListener("click", () => {
    for (let i = 0; i < numberOfPokemon.value; i++) {
        fetchData(team2);
    }
    fightTurn(counter);
});

function showAbilities(numberRandom) {
    const team = numberRandom === 1 ? team1 : team2;
    if (!team.children.length) return;
    const randomIndex = Math.floor(Math.random() * team.children.length);
    const selectedPokemon = team.children[randomIndex];
    const abilities = selectedPokemon.querySelector(".abilities").textContent;
    infoText.innerHTML += `Random Pokémon abilities: ${abilities}<br>`;
}



function assignInitialHP(card) {
    const hp = 100;
    card.setAttribute("data-hp", hp);
    const hpElement = document.createElement("p");
    hpElement.classList.add("hp");
    hpElement.textContent = `HP: ${hp}`;
    card.appendChild(hpElement);
}
function fightTurn(turn) {
    if (turn % 2 == 0) {
        let attacker = team2;
        let defender = team1;
        if (defender.classList.contains('blurred')) {
            defender.classList.remove("blurred");
        }
        attacker.classList.add("blurred");
    }
    else {
        let attacker = team1;
        let defender = team2;
        if (defender.classList.contains('blurred')) {
            defender.classList.remove("blurred");
        }
        attacker.classList.add("blurred");
    }
}
// function takeoutBlurr() {
//     team1.classList.remove("blurred");
//     team2.classList.remove("blurred");
// }
let counter = 0;

// Genera un daño basado en el ataque, defensa y daño del movimiento
function calculateDamage(movePower, attackerAttack, defenderDefense) {
    let damage = 0;
    if (movePower >= 100) {
        if (Math.floor(Math.random() * 20) <= 3) {
            damage = Math.max(Math.floor((movePower * ((attackerAttack) / defenderDefense)) + 2), 1);
            console.log("pepe" + damage);
            return damage;
        }
        else {
            damage = Math.max(Math.floor((movePower * 0.25 * ((attackerAttack) / defenderDefense)) + 1), 1);
            console.log("2do" + damage);
            return damage;
        }
    }
    damage = Math.max(Math.floor((movePower * 0.5 * ((attackerAttack) / defenderDefense)) + 2), 1);
    console.log("ultimo" + damage);
    return damage;
}
// Aplica daño al objetivo y verifica si es derrotado
function applyDamage(targetCard, damage) {
    const hpElement = targetCard.querySelector(".hp");
    let currentHP = parseInt(hpElement.textContent.split(": ")[1]); // Extraer solo el número
    currentHP -= damage;

    // Asegurarse de no tener valores negativos
    currentHP = Math.max(currentHP, 0);

    hpElement.textContent = `HP: ${currentHP}`;
    // Si el HP llega a 0, el Pokémon queda derrotado
    if (currentHP === 0) {
        updateCardColorForDefeat(targetCard);
        targetCard.querySelector(".moves-container").innerHTML = "Defeated!";
        infoText.innerHTML += `${targetCard.querySelector(".pokeName").textContent} has been defeated.<br>`;
        if (counter % 2 == 0) {
            infoText.innerHTML += 'El ganador es el jugador 2 !';
            team1.classList.add("blurred");
            team2.classList.remove("blurred");
        }
        else {
            infoText.innerHTML += 'El ganador es el jugador 1 !';
            team2.classList.add("blurred");
            team1.classList.remove("blurred");
        }
        defeated = true;
    }
}
// function changeTurn() {
//     if (team1.children.length != 0 && team2.children.length != 0) {
//         infoText.innerHTML += `Battle started between ${team1.children.length} and ${team2.children.length} pokemon.<br>`;
//         infoText.innerHTML += 'Es el turno del jugador ' + (counter % 2 + 1) + '<br>';
//     }
// }

// Añade los movimientos como botones a la tarjeta del Pokémon
async function addMovesToCard(card, data_moves, attackerAttack, defenderCard) {
    const movesContainer = card.querySelector(".moves-container");
    for (let i = 0; i < Math.min(4, data_moves.length); i++) {
        const move = data_moves[i];
        const moveData = await fetchDataMovements(move.move.url);
        // Crear el botón del movimiento
        const moveButton = document.createElement("button");
        moveButton.textContent = `${moveData.name} (${moveData.power || "N/A"})`;
        moveButton.classList.add("move-button");
        // Asigna un evento al botón para seleccionar objetivo y aplicar el movimiento
        moveButton.addEventListener("click", () => {
            if (!moveData.power) {
                alert("This move has no power defined!");
                return;
            }

            // Mostrar opciones de selección de objetivo
            const defenderOptions = Array.from(defenderCard.children);
            if (defenderOptions.length === 0) {
                alert("No Pokémon available in the opposing team!");
                return;
            }
            // Crear un mensaje para seleccionar objetivo
            fightTurn(counter);
            counter++;
            console.log(counter);
            fightTurn(counter);
            const targetSelector = document.createElement("div");
            targetSelector.classList.add("target-selector");
            targetSelector.innerHTML = `<p>Select a target Pokémon:</p>`;
            defenderOptions.forEach(defender => {
                const targetButton = document.createElement("button");
                targetButton.textContent = defender.querySelector(".pokeName").textContent;
                targetButton.classList.add("target-button");

                // Al seleccionar un objetivo, aplicar daño

                targetButton.addEventListener("click", () => {
                    const defenderDefense = parseInt(defender.querySelector(".defense").textContent.split(": ")[1]);
                    const damage = calculateDamage(moveData.power, attackerAttack, defenderDefense);
                    applyDamage(defender, damage);
                    if (!defeated)
                        infoText.innerHTML += `Damage dealt to ${defenderCard.querySelector(".pokeName").textContent}: ${damage}<br>`;
                    // Remover selector de objetivo después de usar
                    if (!defeated)
                        infoText.innerHTML += 'Es el turno del jugador ' + (counter % 2 + 1) + '<br>';
                    document.body.removeChild(targetSelector);
                    // takeoutBlurr();
                });

                targetSelector.appendChild(targetButton);
            });

            // Agregar selector al DOM
            document.body.appendChild(targetSelector);

        });
        movesContainer.appendChild(moveButton);

    }
    if (team1.children.length == pokemonLimit) {
        firsttext.innerHTML += `Batalla empezada! <br>`;
        firsttext.innerHTML += 'Es el turno del jugador ' + (counter % 2 + 1) + '<br>';
    }
}


