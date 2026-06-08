using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CharacterCustomizationController : MonoBehaviour
{
    [Header("Character Preview")]
    public Image headImage;
    public Image hairImage;
    public Image bodyImage;

    [Header("Controls")]
    public TMP_InputField nameInput;
    public Button[] skinToneButtons;
    public Button genderHombre;
    public Button genderMujer;
    public TextMeshProUGUI outfitLabel;
    public Button prevOutfitButton;
    public Button nextOutfitButton;
    public Button startButton;

    static readonly Color[] SkinTones = {
        new Color(1.00f, 0.87f, 0.75f),
        new Color(0.94f, 0.76f, 0.58f),
        new Color(0.78f, 0.58f, 0.39f),
        new Color(0.55f, 0.35f, 0.20f),
        new Color(0.35f, 0.22f, 0.13f),
    };

    static readonly Color[] OutfitColors = {
        new Color(0.94f, 0.94f, 0.94f),
        new Color(0.16f, 0.50f, 0.73f),
        new Color(0.16f, 0.16f, 0.16f),
        new Color(0.55f, 0.35f, 0.10f),
    };

    static readonly string[] OutfitNames = {
        "White Tee", "Guayabera", "Hoodie", "Work Apron"
    };

    int selectedSkin = 0;
    int selectedOutfit = 0;
    bool isMujer = false;

    void Start()
    {
        for (int i = 0; i < skinToneButtons.Length; i++)
        {
            int idx = i;
            skinToneButtons[i].GetComponent<Image>().color = SkinTones[i];
            skinToneButtons[i].onClick.AddListener(() => SelectSkin(idx));
        }

        prevOutfitButton.onClick.AddListener(() => {
            selectedOutfit = (selectedOutfit - 1 + OutfitNames.Length) % OutfitNames.Length;
            RefreshPreview();
        });
        nextOutfitButton.onClick.AddListener(() => {
            selectedOutfit = (selectedOutfit + 1) % OutfitNames.Length;
            RefreshPreview();
        });

        genderHombre.onClick.AddListener(() => { isMujer = false; RefreshPreview(); });
        genderMujer.onClick.AddListener(() => { isMujer = true; RefreshPreview(); });

        startButton.onClick.AddListener(OnStart);
        RefreshPreview();
    }

    void SelectSkin(int idx)
    {
        selectedSkin = idx;
        RefreshPreview();
    }

    void RefreshPreview()
    {
        if (headImage != null) headImage.color = SkinTones[selectedSkin];
        if (bodyImage != null) bodyImage.color = OutfitColors[selectedOutfit];
        if (outfitLabel != null) outfitLabel.text = OutfitNames[selectedOutfit];

        if (hairImage != null)
        {
            hairImage.color = new Color(0.13f, 0.07f, 0.02f);
            var hairRT = hairImage.GetComponent<RectTransform>();
            hairRT.sizeDelta = isMujer ? new Vector2(74f, 42f) : new Vector2(58f, 22f);
        }

        Color activeColor   = new Color(0.25f, 0.65f, 0.95f);
        Color inactiveColor = new Color(0.28f, 0.28f, 0.28f);

        if (genderHombre != null)
            genderHombre.GetComponent<Image>().color = !isMujer ? activeColor : inactiveColor;
        if (genderMujer != null)
            genderMujer.GetComponent<Image>().color = isMujer ? activeColor : inactiveColor;
    }

    void OnStart()
    {
        string entered = nameInput != null ? nameInput.text.Trim() : "";
        if (string.IsNullOrEmpty(entered)) entered = "Player";

        if (GameManager.Instance != null)
        {
            GameManager.Instance.PlayerName = entered;
            GameManager.Instance.SkinToneIndex = selectedSkin;
            GameManager.Instance.OutfitIndex = selectedOutfit;
            GameManager.Instance.IsMujer = isMujer;
            GameManager.Instance.StartNewGame();
        }
        else
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene(1);
        }
    }
}
