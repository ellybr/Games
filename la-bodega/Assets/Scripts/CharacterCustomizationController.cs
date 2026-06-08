using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class CharacterCustomizationController : MonoBehaviour
{
    [Header("Name")]
    public TMP_InputField nameInput;

    [Header("Skin Tone")]
    public Button[] skinToneButtons;

    [Header("Outfit")]
    public TextMeshProUGUI outfitLabel;
    public Button prevOutfitButton;
    public Button nextOutfitButton;

    [Header("Start")]
    public Button startButton;

    static readonly Color[] SkinTones = {
        new Color(1.00f, 0.87f, 0.75f),
        new Color(0.94f, 0.76f, 0.58f),
        new Color(0.78f, 0.58f, 0.39f),
        new Color(0.55f, 0.35f, 0.20f),
        new Color(0.35f, 0.22f, 0.13f),
    };

    static readonly string[] OutfitNames = {
        "Classic Tee", "Guayabera", "Hoodie", "Work Apron"
    };

    int selectedSkin = 2;
    int selectedOutfit = 0;

    void Start()
    {
        for (int i = 0; i < skinToneButtons.Length; i++)
        {
            int idx = i;
            skinToneButtons[i].GetComponent<Image>().color = SkinTones[i];
            skinToneButtons[i].onClick.AddListener(() => SelectSkin(idx));
        }

        prevOutfitButton.onClick.AddListener(PrevOutfit);
        nextOutfitButton.onClick.AddListener(NextOutfit);
        startButton.onClick.AddListener(OnStart);

        RefreshOutfit();
    }

    void SelectSkin(int idx) => selectedSkin = idx;

    void PrevOutfit()
    {
        selectedOutfit = (selectedOutfit - 1 + OutfitNames.Length) % OutfitNames.Length;
        RefreshOutfit();
    }

    void NextOutfit()
    {
        selectedOutfit = (selectedOutfit + 1) % OutfitNames.Length;
        RefreshOutfit();
    }

    void RefreshOutfit()
    {
        if (outfitLabel != null)
            outfitLabel.text = OutfitNames[selectedOutfit];
    }

    void OnStart()
    {
        if (GameManager.Instance != null)
        {
            string entered = nameInput != null ? nameInput.text.Trim() : "";
            GameManager.Instance.PlayerName = string.IsNullOrEmpty(entered) ? "Player" : entered;
            GameManager.Instance.SkinToneIndex = selectedSkin;
            GameManager.Instance.OutfitIndex = selectedOutfit;
            GameManager.Instance.StartNewGame();
        }
        else
        {
            UnityEngine.SceneManagement.SceneManager.LoadScene(1);
        }
    }
}
