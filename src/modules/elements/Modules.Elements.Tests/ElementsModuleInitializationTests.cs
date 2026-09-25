using AwesomeAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Starlights.Modules.Elements.Data;
using Starlights.Modules.Elements.Domain;
using Starlights.Modules.Elements.Domain.Components;
using Starlights.Modules.Elements.Services;
using Starlights.Platform.Data;

namespace Starlights.Modules.Elements.Tests;

[TestClass]
public class ElementsModuleInitializationTests
{
    private readonly Mock<ILogger<ElementsModuleInitializer>> _loggerMock = new();
    private readonly Mock<IPersistence> _persistenceMock = new();
    private readonly Mock<IElementsRepository> _elementsRepositoryMock = new();

    // SUT
    private readonly ElementsModuleInitializer _initialization;

    public ElementsModuleInitializationTests()
    {
        _initialization = new ElementsModuleInitializer(_loggerMock.Object, _persistenceMock.Object);

        _persistenceMock.Setup(x => x.GetRepository<IElementsRepository>())
            .Returns(_elementsRepositoryMock.Object);

        _elementsRepositoryMock.Setup(x => x.AnyElementsAsync())
            .ReturnsAsync(false);
    }

    [TestMethod]
    public async Task NewElementsStored()
    {
        // Act
        var result = await _initialization.InitializeAsync();

        // Assert
        _elementsRepositoryMock.Verify(x => x.Add(It.IsAny<Element>()), Times.AtLeastOnce);
        _persistenceMock.Verify(x => x.SaveChangesAsync(), Times.Once);
    }

    [TestMethod]
    public async Task InitializeAsync_WhenElementsExist_AddsNothing()
    {
        // Arrange
        _elementsRepositoryMock.Setup(x => x.AnyElementsAsync())
            .ReturnsAsync(true);

        // Act
        var result = await _initialization.InitializeAsync();

        // Assert
        result.NewElementsCount.Should().Be(0, "a database that already holds elements must not be seeded again");
        _elementsRepositoryMock.Verify(x => x.Add(It.IsAny<Element>()), Times.Never);
        _persistenceMock.Verify(x => x.SaveChangesAsync(), Times.Never);
    }

    [TestMethod]
    public async Task InitializeAsync_EmptyDatabase_SeedsOnlySrdBackgrounds()
    {
        // Arrange
        var srdBackgrounds = new[] { "Acolyte", "Criminal", "Sage", "Soldier" };
        var added = CaptureAddedElements();

        // Act
        await _initialization.InitializeAsync();

        // Assert
        var backgrounds = added.Where(e => e.Type == ElementTypeConstants.Background).Select(e => e.Name);
        backgrounds.Should().NotBeEmpty("the seed includes backgrounds")
            .And.BeSubsetOf(srdBackgrounds, "only SRD 5.2.1 backgrounds may ship in the seed");
    }

    [TestMethod]
    public async Task InitializeAsync_EmptyDatabase_MarksMadeUpElementsAsTestOnly()
    {
        // Arrange
        var madeUp = new[]
        {
            "Barbarian Feature 1", "Barbarian Feature 2", "Barbarian Feature 2.1", "Barbarian Feature 3",
            "Barbarian SubClass 1", "Barbarian SubClass 2", "Path of the Strong Dude",
            "Rogue Feature 1", "Rogue Feature 2", "Rogue Feature 3",
            "Human Feature", "Elf Feature", "Acolyte Feature", "Criminal Feature",
        };
        var added = CaptureAddedElements();

        // Act
        await _initialization.InitializeAsync();

        // Assert
        var marked = added
            .Where(e => madeUp.Contains(e.Name))
            .Where(e => e.GetComponent<DescriptionComponent>()?.Content.Contains(ElementsModuleInitializer.TestOnlyNote) == true)
            .Select(e => e.Name);
        marked.Should().BeEquivalentTo(madeUp, "every invented seed element must say it is not SRD content");
    }

    private List<Element> CaptureAddedElements()
    {
        var added = new List<Element>();
        _elementsRepositoryMock.Setup(x => x.Add(It.IsAny<Element>()))
            .Callback<Element>(added.Add);

        return added;
    }
}
